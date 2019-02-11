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

type SFn<A> = ((O<A>) => void, Scheduler) => Disposable

export class S<A> {
  f: SFn<A>
  constructor(f: SFn<A>) {
    this.f = f
  }
  map<B>(f: A => B): S<B> {
    return new S((o, scheduler) =>
      this.f(e => {
        if (e.type === 'event')
          try {
            o(event(e.t, f(e.v)))
          } catch (err) {
            o(error(e.t, err))
          }
        else o(e)
      }, scheduler)
    )
  }
  sum<B>(sb: S<B>): S<A | B> {
    return new S((o, scheduler) => {
      var i = 2
      return disposable.mappend(this.f(sum, scheduler), sb.f(sum, scheduler))
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
      return disposable.mappend(
        this.f(e => {
          if (e.type === 'event') {
            ab[0] = e.v
            if (ab[1]) o(event(e.t, [e.v, ab[1]]))
          } else if (e.type === 'end') --i === 0 ? o(e) : void 0
          else o(e)
        }, scheduler),
        sb.f(e => {
          if (e.type === 'event') {
            ab[1] = e.v
            if (ab[0]) o(event(e.t, [ab[0], e.v]))
          } else if (e.type === 'end') --i === 0 ? o(e) : void 0
          else o(e)
        }, scheduler)
      )
    })
  }
  flatMap<B>(f: A => S<B>): S<B> {
    return new S((o, scheduler) => {
      var i = 0
      var active = true
      const dm = new Map()
      const d = {
        dispose() {
          active = false
          dm.forEach(d => d.dispose())
        }
      }
      const di = i++
      dm.set(
        di,
        this.f(e => {
          if (e.type === 'event') {
            try {
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
            } catch (err) {
              o(error(e.t, err))
            }
          } else if (e.type === 'end') {
            dm.delete(di)
            if (dm.size === 0) o(e)
          } else o(e)
        }, scheduler)
      )
      return d
    })
  }
  until<B>(s: S<B>): S<A> {
    return new S((o, scheduler) => {
      var active = true
      const du = s.f(e => {
        if (!active) return
        active = false
        if (e.type === 'event') o(end(e.t))
        else o(e)
      }, scheduler)
      const da = this.f(e => {
        if (!active) return
        if (e.type !== 'event') active = false
        o(e)
      }, scheduler)
      return {
        dispose() {
          active = false
          da.dispose()
          du.dispose()
        }
      }
    })
  }
  take(n: number): S<A> {
    return new S((o, scheduler) => {
      if (n <= 0) return scheduler.scheduleD(0, t => o(end(t)))
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
  skip(n: number): S<A> {
    if (n <= 0) return this
    return new S((o, scheduler) => {
      var i = 0
      const d = this.f(e => {
        if (e.type === 'event') {
          if (i++ < n) return
          o(e)
        } else o(e)
      }, scheduler)
      return d
    })
  }
  scan<B>(f: (B, A) => B, b: B): S<B> {
    return new S((o, scheduler) => {
      var active = true
      var b_ = b
      scheduler.schedule(0, t => {
        if (active) o(event(t, b_))
      })
      const d = this.f(e => {
        if (e.type === 'event')
          try {
            o(event(e.t, (b_ = f(b_, e.v))))
          } catch (err) {
            o(error(e.t, err))
          }
        else o(e)
      }, scheduler)
      return {
        dispose() {
          active = false
          d.dispose()
        }
      }
    })
  }
  run(o: (O<A>) => void, scheduler: Scheduler): Disposable {
    var disposed = false
    var dupstream
    const d = {
      dispose() {
        if (disposed) return
        disposed = true
        dupstream.dispose()
      }
    }
    dupstream = this.f(function safeO(e) {
      if (e.type === 'event' || e.type === 'end') {
        try {
          o(e)
        } catch (err) {
          d.dispose()
          o(error(e.t, err))
        }
      } else {
        d.dispose()
        o(e)
      }
    }, scheduler.local())
    return d
  }

  multicast(): Multicast<A> {
    var df: ?Disposable
    var os: Array<(O<A>) => void> = []
    return new Multicast((o, scheduler) => {
      os.push(o)
      if (df == null) df = this.f(e => os.forEach(o => o(e)), scheduler)
      return {
        dispose: () => {
          const i = os.indexOf(o)
          if (i === -1) return
          os.splice(i, 1)
          const d = df
          if (os.length === 0 && d) {
            df = null
            d.dispose()
          }
        }
      }
    })
  }

  static of(f: SFn<A>): S<A> {
    return new S((o, scheduler) => {
      var active = true
      var d = null
      scheduler.schedule(0, t => {
        if (!active) return
        try {
          d = f(function activeO(e) {
            if (!active) return
            if (e.type !== 'event') active = false
            o(e)
          }, scheduler)
        } catch (err) {
          if (active) o(error(t, err))
        }
      })
      return {
        dispose() {
          active = false
          if (d) d.dispose()
        }
      }
    })
  }
  static periodic(period: number): S<number> {
    return new S((o, scheduler) => {
      var active = true
      scheduler.schedule(0, function rec(t) {
        if (active) o(event(t, t))
        if (active) scheduler.schedule(period, rec)
      })
      return {
        dispose() {
          active = false
        }
      }
    })
  }
  static never(): S<A> {
    return new S(() => disposable.empty)
  }
  static empty(): S<A> {
    return new S((o, scheduler) => scheduler.scheduleD(0, t => o(end(t))))
  }
  static at(a: A, delay: number = 0): S<A> {
    return new S((o, scheduler) =>
      scheduler.scheduleD(delay, (t, ref) => {
        o(event(t, a))
        if (ref.active) o(end(t))
      })
    )
  }
  static throwError(err: Error, delay: number = 0): S<A> {
    return new S((o, scheduler) =>
      scheduler.scheduleD(delay, t => o(error(t, err)))
    )
  }
  static fromArray(as: Array<A>, delay: number = 0): S<A> {
    return new S((o, scheduler) =>
      scheduler.scheduleD(delay, (t, ref) => {
        for (var i = 0, l = as.length; i < l; i++) {
          o(event(t, as[i]))
          if (!ref.active) return
        }
        o(end(t))
      })
    )
  }
}

export class Multicast<A> extends S<A> {
  multicast(): Multicast<A> {
    return this
  }
}
