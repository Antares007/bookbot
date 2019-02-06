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
          if (d) d.dispose()
          return o(err)
        }
      active = false
      if (e.type === 'error' && d) d.dispose()
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
  return (e: O<A>) => (e.type === 'event' ? o(event(e.t, f(e.v))) : o(e))
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return Of((o, scheduler) => s(omap(f, o), scheduler))
}

export function sum<A, B>(sa: S<A>, sb: S<B>): S<A | B> {
  return Of((o, schedule) => {
    var i = 2
    const da = sa(sum, schedule)
    const db = sb(sum, schedule)
    return {
      dispose() {
        da.dispose()
        db.dispose()
      }
    }
    function sum(e) {
      if (e.type === 'event') o(event(e.t, e.v))
      else if (e.type === 'end') --i === 0 ? o(e) : void 0
      else o(e)
    }
  })
}

export function product<A, B>(sa: S<A>, sb: S<B>): S<[A, B]> {
  return Of((o, schedule) => {
    var i = 2
    const ab: [?A, ?B] = [null, null]
    const da = sa(e => {
      if (e.type === 'event') {
        ab[0] = e.v
        if (ab[1]) o(event(e.t, [e.v, ab[1]]))
      } else if (e.type === 'end') --i === 0 ? o(e) : void 0
      else o(e)
    }, schedule)
    const db = sb(e => {
      if (e.type === 'event') {
        ab[1] = e.v
        if (ab[0]) o(event(e.t, [ab[0], e.v]))
      } else if (e.type === 'end') --i === 0 ? o(e) : void 0
      else o(e)
    }, schedule)
    return {
      dispose() {
        da.dispose()
        db.dispose()
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
        if (e.type === 'event')
          ds.push(
            e.v(e => {
              if (e.type === 'event') o(e)
              else if (e.type === 'end') ++i === ds.length ? o(e) : void 0
              else o(e)
            }, relative(e.t, schedule))
          )
        else if (e.type === 'end') ++i === ds.length ? o(e) : void 0
        else o(e)
      }, schedule)
    )
    return d
  })
}
