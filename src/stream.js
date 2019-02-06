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

export function Of<A>(f: S<A>): S<A> {
  return (o, schedule) => {
    const ref = aRef()
    return disposable.mappend(
      aDisposable(ref),
      f(trySink(aSink(ref, o)), local(schedule))
    )
  }
}

export function at<A>(a: A, delay: number): S<A> {
  return (sink_, schedule) => {
    const ref = aRef()
    const sink = trySink(aSink(ref, sink_))
    local(schedule)(delay, t => {
      sink(event(t, a))
      sink(end(t))
    })
    return disposable.mappend(aDisposable(ref))
  }
}

export function throwError<A>(err: Error): S<A> {
  return (sink_, schedule) => {
    const ref = aRef()
    const sink = aSink(ref, sink_)
    local(schedule)(0, t => sink(error(t, err)))
    return aDisposable(ref)
  }
}

export function fromArray<A>(as: Array<A>): S<A> {
  return (sink_, scheduler) => {
    const ref = aRef()
    const sink = trySink(aSink(ref, sink_))
    local(scheduler)(0, t => {
      for (var i = 0, l = as.length; i < l && ref.active; i++)
        sink(event(t, as[i]))
      sink(end(t))
    })
    return aDisposable(ref)
  }
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return (sink, scheduler) =>
    s(e => (e.type === 'event' ? sink(event(e.t, f(e.v))) : sink(e)), scheduler)
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
