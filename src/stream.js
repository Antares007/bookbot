// @flow strict
import type { Scheduler, TimePoint } from './scheduler'
import type { Disposable } from './disposable'
import { relative, local } from './scheduler'
import * as disposable from './disposable'

export type O<A> =
  | { type: 'event', t: TimePoint, v: A }
  | { type: 'end', t: TimePoint }
  | { type: 'error', t: TimePoint, v: Error }

export function event<A>(t: TimePoint, v: A): O<A> {
  return { type: 'event', t, v }
}
export function end<A>(t: TimePoint): O<A> {
  return { type: 'end', t }
}
export function error<A>(t: TimePoint, v: Error): O<A> {
  return { type: 'error', t, v }
}

export type S<A> = ((O<A>) => void, Scheduler) => Disposable

export const empty = () => disposable.empty

export function Of<A>(f: ((O<A>) => void, Scheduler) => ?Disposable): S<A> {
  return function stream$Of(o, schedule) {
    var active = true
    const d = f(function safeO(e) {
      if (!active) return
      if (e.type === 'event')
        try {
          return o(e)
        } catch (err) {
          active = false
          return o(err)
        }
      active = false
      o(e)
    }, local(schedule))
    return {
      dispose() {
        if (!active) return
        active = false
        if (d) d.dispose()
      }
    }
  }
}

export function at<A>(a: A, delay: number = 0): S<A> {
  return Of((o, schedule) => {
    schedule(delay, t => {
      o(event(t, a))
      o(end(t))
    })
  })
}

export function throwError<A>(err: Error, delay: number = 0): S<A> {
  return Of((o, schedule) => {
    schedule(delay, t => o(error(t, err)))
  })
}

export function fromArray<A>(as: Array<A>, delay: number = 0): S<A> {
  return Of((o, schedule) => {
    var active = true
    schedule(delay, t => {
      for (var i = 0, l = as.length; i < l; i++) {
        o(event(t, as[i]))
        if (!active) break
      }
      o(end(t))
    })
    return {
      dispose() {
        active = false
      }
    }
  })
}

export function omap<A, B>(f: A => B, o: (O<B>) => void): (O<A>) => void {
  return (e: O<A>) => {
    if (e.type === 'event') o(event(e.t, f(e.v)))
    else o(e)
  }
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return Of((o, scheduler) => s(omap(f, o), scheduler))
}

export function sum<A, B>(sa: S<A>, sb: S<B>): S<A | B> {
  return Of((o, schedule) => {
    var i = 2
    const d = disposable.mappend(sa(sum, schedule), sb(sum, schedule))
    return d
    function sum(e) {
      if (e.type === 'event') {
        o(event(e.t, e.v))
      } else if (e.type === 'end') {
        if (--i === 0) o(e)
      } else {
        d.dispose()
        o(e)
      }
    }
  })
}

export function join<A>(s: S<S<A>>): S<A> {
  return Of((o, schedule) => {
    var i = 0
    const ds = []
    const d = {
      dispose() {
        for (var d of ds) d.dispose()
      }
    }
    ds.push(
      s(e => {
        if (e.type === 'event') {
          ds.push(
            e.v(e => {
              if (e.type === 'event') {
                o(e)
              } else if (e.type === 'end') {
                if (++i === ds.length) o(e)
              } else {
                d.dispose()
                o(e)
              }
            }, relative(e.t, schedule))
          )
        } else if (e.type === 'end') {
          if (++i === ds.length) o(e)
        } else {
          d.dispose()
          o(e)
        }
      }, schedule)
    )
    return d
  })
}

export function prod<A, B>(sa: S<A>, sb: S<B>): S<[A, B]> {
  return Of((o, schedule) => {
    var i = 2
    const ab: [?A, ?B] = [null, null]
    const d = disposable.mappend(
      sa(e => {
        if (e.type === 'event') {
          ab[0] = e.v
          if (ab[1]) o(event(e.t, [e.v, ab[1]]))
        } else if (e.type === 'end') {
          if (--i === 0) o(e)
        } else {
          d.dispose()
          o(e)
        }
      }, schedule),
      sb(e => {
        if (e.type === 'event') {
          ab[1] = e.v
          if (ab[0]) o(event(e.t, [ab[0], e.v]))
        } else if (e.type === 'end') {
          if (--i === 0) o(e)
        } else {
          d.dispose()
          o(e)
        }
      }, schedule)
    )
    return d
  })
}

export function merge<A>(...lr: Array<S<A>>): S<A> {
  return (sink_, schedule) => {
    const m: Map<number, Disposable> = new Map()
    const ref = aRef()
    const sink = aSink(ref, sink_)
    for (var i = 0, l = lr.length; i < l; i++) {
      m.set(i, lr[i](indexSink(i, m, sink), schedule))
    }
    return aDisposable(ref, () => m.forEach(d => d.dispose()))
  }
}

export function combine<A>(...lr: Array<S<A>>): S<Array<A>> {
  return (sink_, schedule) => {
    const m: Map<number, Disposable> = new Map()
    const ref = aRef()
    const sink = aSink(ref, sink_)
    const as: Array<?A> = lr.map(() => null)
    const iSink = (e, i) => {
      if (e.type === 'event') {
        as[i] = e.v
        const clone = []
        for (let a of as) {
          if (a == null) return
          clone.push(a)
        }
        sink(event(e.t, clone))
      } else {
        sink(e)
      }
    }
    for (var i = 0, l = lr.length; i < l; i++)
      m.set(i, lr[i](indexSink(i, m, iSink), schedule))
    return aDisposable(ref, () => m.forEach(d => d.dispose()))
  }
}

export function flatMap<A, B>(f: A => S<B>, s: S<A>): S<B> {
  return (sink_, schedule) => {
    const m: Map<number, Disposable> = new Map()
    const ref = aRef()
    const sink = aSink(ref, sink_)
    let i = 0
    m.set(
      i,
      s(
        indexSink(i, m, eo => {
          if (eo.type === 'event') {
            i++
            m.set(
              i,
              f(eo.v)(
                indexSink(i, m, ei => {
                  if (ei.type === 'event') sink(event(ei.t, ei.v))
                  else if (ei.type === 'end') sink(end(ei.t))
                  else sink(error(ei.t, ei.v))
                }),
                relative(eo.t, schedule)
              )
            )
          } else {
            sink(eo)
          }
        }),
        schedule
      )
    )
    return aDisposable(ref, () => m.forEach(d => d.dispose()))
  }
}

function indexSink<A>(
  index: number,
  dmap: Map<number, Disposable>,
  o: (O<A>, number) => void
): (O<A>) => void {
  return e => {
    if (e.type === 'event') {
      o(e, index)
    } else if (e.type === 'end') {
      dmap.delete(index)
      if (dmap.size !== 0) return
      o(e, index)
    } else {
      dmap.forEach(d => d.dispose)
      o(e, index)
    }
  }
}

function aSink<A>(ref: { active: boolean }, o: (O<A>) => void): (O<A>) => void {
  return e => {
    if (!ref.active) return
    if (e.type === 'event') return o(e)
    ref.active = false
    o(e)
  }
}

function trySink<A>(o: (O<A>) => void): (O<A>) => void {
  return e => {
    if (e.type === 'error') return o(e)
    try {
      o(e)
    } catch (err) {
      o(error(e.t, err))
    }
  }
}

function aRef() {
  return { active: true }
}

function aDisposable(ref: { active: boolean }, f?: () => void): Disposable {
  return {
    dispose() {
      if (!ref.active) return
      ref.active = false
      if (f != null) f()
    }
  }
}
