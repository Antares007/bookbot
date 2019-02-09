// @flow strict
import type { TimePoint } from './scheduler'
import type { Disposable } from './disposable'
import { Scheduler } from './scheduler'
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

type SFn<A> = ((O<A>) => void, Scheduler) => ?Disposable

export class S<A> {
  f: SFn<A>
  constructor(f: SFn<A>) {
    this.f = f
  }
  map<B>(f: A => B): S<B> {
    return new S((o, scheduler) =>
      this.f(
        e => (e.type === 'event' ? o(event(e.t, f(e.v))) : o(e)),
        scheduler
      )
    )
  }
  sum<B>(sb: S<B>): S<A | B> {
    return new S((o, scheduler) => {
      var i = 2
      const da = this.f(sum, scheduler)
      const db = sb.f(sum, scheduler)
      return da && db
        ? {
            dispose() {
              da.dispose()
              db.dispose()
            }
          }
        : da
        ? da
        : db
      function sum(e) {
        if (e.type === 'event') o(event(e.t, e.v))
        else if (e.type === 'end') --i === 0 ? o(e) : void 0
        else o(e)
      }
    })
  }
  product<B>(sb: S<B>): S<[A, B]> {
    return new S((o, scheduler) => {
      var i = 2
      const ab: [?A, ?B] = [null, null]
      const da = this.f(e => {
        if (e.type === 'event') {
          ab[0] = e.v
          if (ab[1]) o(event(e.t, [e.v, ab[1]]))
        } else if (e.type === 'end') --i === 0 ? o(e) : void 0
        else o(e)
      }, scheduler)
      const db = sb.f(e => {
        if (e.type === 'event') {
          ab[1] = e.v
          if (ab[0]) o(event(e.t, [ab[0], e.v]))
        } else if (e.type === 'end') --i === 0 ? o(e) : void 0
        else o(e)
      }, scheduler)
      return da && db
        ? {
            dispose() {
              da.dispose()
              db.dispose()
            }
          }
        : da
        ? da
        : db
    })
  }
  join<B>(f: A => S<B>): S<B> {
    return new S((o, scheduler) => {
      var i = 0
      const dm = new Map()
      const d = {
        dispose() {
          dm.forEach(d => {
            if (d) d.dispose()
          })
        }
      }
      const di = i++
      dm.set(
        di,
        this.f(e => {
          if (e.type === 'event') {
            const di = i++
            dm.set(
              di,
              f(e.v).f(e => {
                if (e.type === 'event') o(e)
                else if (e.type === 'end') {
                  dm.delete(di)
                  if (dm.size === 0) o(e)
                } else o(e)
              }, scheduler)
            )
          } else if (e.type === 'end') {
            dm.delete(di)
            if (dm.size === 0) o(e)
          } else o(e)
        }, scheduler)
      )
      return d
    })
  }
  take(n: number): S<A> {
    return new S((o, scheduler) => {
      if (n <= 0) return scheduler.schedule(0, t => o(end(t)))
      var i = 0
      const d = this.f(e => {
        if (e.type === 'event') {
          o(e)
          if (++i === n) {
            if (d) d.dispose()
            o(end(e.t))
          }
        } else o(e)
      }, scheduler)
      return d
    })
  }
  scan<B>(f: (B, A) => B, b: B): S<B> {
    return new S((o, scheduler) => {
      var active = true
      var b_ = b
      scheduler.schedule(0, t => o(event(t, b_)))
      return this.f(e => {
        if (e.type === 'event') {
          b_ = f(b_, e.v)
          o(event(e.t, b_))
        } else o(e)
      }, scheduler)
    })
  }
  run(o: (O<A>) => void, scheduler: Scheduler): Disposable {
    var active = true
    const d = this.f(function safeO(e) {
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
    }, scheduler.local())
    return {
      dispose() {
        if (!active) return
        active = false
        if (d) d.dispose()
      }
    }
  }

  static periodic(period: number): S<number> {
    return new S((o, scheduler) => {
      var active = true
      scheduler.schedule(0, function rec(t) {
        o(event(t, t))
        if (active) scheduler.schedule(period, rec)
      })
      return {
        dispose() {
          active = false
        }
      }
    })
  }
  static empty(): S<A> {
    return new S(() => {})
  }

  static of(f: ((O<A>) => void, Scheduler) => ?Disposable): S<A> {
    return new S(f)
  }

  static at(a: A, delay: number = 0): S<A> {
    return new S((o, scheduler) => {
      var active = true
      scheduler.schedule(delay, t => {
        o(event(t, a))
        if (active) o(end(t))
      })
      return {
        dispose() {
          active = false
        }
      }
    })
  }

  static throwError(err: Error, delay: number = 0): S<A> {
    return new S((o, scheduler) => {
      scheduler.schedule(delay, t => o(error(t, err)))
    })
  }

  static fromArray(as: Array<A>, delay: number = 0): S<A> {
    return new S((o, scheduler) => {
      var active = true
      scheduler.schedule(delay, t => {
        for (var i = 0, l = as.length; i < l; i++) {
          o(event(t, as[i]))
          if (!active) return
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
}
