// @flow strict
import type { TimePoint } from './scheduler'
import type { Disposable } from './disposable'
import type { scheduler$O } from './scheduler'
import { Scheduler, now, delay, local } from './scheduler'
import * as disposable from './disposable'

export type stream$O<A> =
  | { type: 'event', t: TimePoint, v: A }
  | { type: 'end', t: TimePoint }
  | { type: 'error', t: TimePoint, v: Error }

type SFn<A> = ((stream$O<A> | scheduler$O) => void) => Disposable

export function event<A>(t: TimePoint, v: A): stream$O<A> {
  return { type: 'event', t, v }
}
export function end<A>(t: TimePoint): stream$O<A> {
  return { type: 'end', t }
}
export function error<A>(t: TimePoint, v: Error): stream$O<A> {
  return { type: 'error', t, v }
}

export class S<A> {
  f: SFn<A>
  constructor(f: SFn<A>) {
    this.f = f
  }
  map<B>(f: A => B): S<B> {
    return new S(o =>
      this.f(e => {
        if (e.type === 'event')
          try {
            o(event(e.t, f(e.v)))
          } catch (err) {
            o(error(e.t, err))
          }
        else o(e)
      })
    )
  }
  sum<B>(sb: S<B>): S<A | B> {
    return new S(o => {
      var i = 2
      return disposable.mappend(this.f(sum), sb.f(sum))
      function sum(e) {
        if (e.type === 'event') o(event(e.t, e.v))
        else if (e.type === 'end') --i === 0 ? o(e) : void 0
        else o(e)
      }
    })
  }
  product<B>(sb: S<B>): S<[A, B]> {
    return new S(o => {
      var i = 2
      const ab: [?A, ?B] = [null, null]
      return disposable.mappend(
        this.f(e => {
          if (e.type === 'event') {
            ab[0] = e.v
            if (ab[1]) o(event(e.t, [e.v, ab[1]]))
          } else if (e.type === 'end') --i === 0 ? o(e) : void 0
          else o(e)
        }),
        sb.f(e => {
          if (e.type === 'event') {
            ab[1] = e.v
            if (ab[0]) o(event(e.t, [ab[0], e.v]))
          } else if (e.type === 'end') --i === 0 ? o(e) : void 0
          else o(e)
        })
      )
    })
  }
  flatMap<B>(f: A => S<B>): S<B> {
    return new S(o => {
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
                })
              )
            } catch (err) {
              o(error(e.t, err))
            }
          } else if (e.type === 'end') {
            dm.delete(di)
            if (dm.size === 0) o(e)
          } else o(e)
        })
      )
      return d
    })
  }
  until<B>(s: S<B>): S<A> {
    return new S(o => {
      var active = true
      const du = s.f(e => {
        if (!active || e.type === 'end') return
        if (e.type === 'error') active = false
        else if (e.type === 'event') {
          active = false
          d.dispose()
          o(end(e.t))
        } else o(e)
      })
      const da = this.f(e => {
        if (!active) return
        if (e.type === 'error' || e.type === 'end') active = false
        o(e)
      })
      const d = {
        dispose() {
          active = false
          da.dispose()
          du.dispose()
        }
      }
      return d
    })
  }
  take(n: number): S<A> {
    if (n <= 0) return S.empty()
    return new S(o => {
      var i = 0
      const d = this.f(e => {
        if (e.type === 'event') {
          o(e)
          if (++i === n) {
            if (d) d.dispose()
            o(end(e.t))
          }
        } else o(e)
      })
      return d
    })
  }
  skip(n: number): S<A> {
    if (n <= 0) return this
    return new S(o => {
      var i = 0
      const d = this.f(e => {
        if (e.type === 'event') {
          if (i++ < n) return
          o(e)
        } else o(e)
      })
      return d
    })
  }
  scan<B>(f: (B, A) => B, b: B): S<B> {
    return new S(o => {
      var active = true
      var b_ = b
      o(
        delay(0, t => {
          if (active) o(event(t, b_))
        })
      )
      const d = this.f(e => {
        if (e.type === 'event')
          try {
            o(event(e.t, (b_ = f(b_, e.v))))
          } catch (err) {
            o(error(e.t, err))
          }
        else o(e)
      })
      return {
        dispose() {
          active = false
          d.dispose()
        }
      }
    })
  }
  run(o: (stream$O<A>) => void, o2: scheduler$O => void): Disposable {
    var disposed = false
    var dupstream
    const d = {
      dispose() {
        if (disposed) return
        disposed = true
        dupstream.dispose()
      }
    }
    const o2loc = local(o2)
    dupstream = this.f(function safeO(e) {
      if (e.type === 'event' || e.type === 'end') {
        try {
          o(e)
        } catch (err) {
          d.dispose()
          o(error(e.t, err))
        }
      } else if (e.type === 'error') {
        d.dispose()
        o(e)
      } else {
        o2loc(e)
      }
    })
    return d
  }

  multicast(): Multicast<A> {
    var df: ?Disposable
    var os: Array<(stream$O<A> | scheduler$O) => void> = []
    return new Multicast(o => {
      os.push(o)
      if (df == null)
        df = this.f(e => {
          if (e.type === 'event' || e.type === 'end' || e.type === 'error')
            os.forEach(o => o(e))
          else o(e)
        })
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
    return new S(o => {
      var active = true
      var d = null
      o(
        delay(0, t => {
          if (!active) return
          try {
            d = f(function activeO(e) {
              if (!active) return
              if (e.type === 'error' || e.type === 'end') active = false
              o(e)
            })
          } catch (err) {
            if (active) o(error(t, err))
          }
        })
      )
      return {
        dispose() {
          active = false
          if (d) d.dispose()
        }
      }
    })
  }
  static periodic(period: number): S<void> {
    return new S(o => {
      var active = true
      o(
        delay(0, function rec(t) {
          if (active) o(event(t, void 0))
          if (active) o(delay(period, rec))
        })
      )
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
    return new S(o => {
      var active = true
      o(
        delay(0, t => {
          if (active) o(end(t))
        })
      )
      return {
        dispose() {
          active = false
        }
      }
    })
  }
  static at(a: A, delay_: number = 0): S<A> {
    return new S(o => {
      var active = true
      o(
        delay(delay_, t => {
          if (active) o(event(t, a))
          if (active) o(end(t))
        })
      )
      return {
        dispose() {
          active = false
        }
      }
    })
  }
  static throwError(err: Error, delay_: number = 0): S<A> {
    return new S(o => {
      var active = true
      o(
        delay(delay_, t => {
          if (active) o(error(t, err))
        })
      )
      return {
        dispose() {
          active = false
        }
      }
    })
  }
  static fromArray(as: Array<A>, delay_: number = 0): S<A> {
    return new S(o => {
      var active = true
      o(
        delay(delay_, t => {
          for (var i = 0, l = as.length; i < l && active; i++)
            o(event(t, as[i]))
          if (active) o(end(t))
        })
      )
      return {
        dispose() {
          active = false
        }
      }
    })
  }
}

export class Multicast<A> extends S<A> {
  multicast(): Multicast<A> {
    return this
  }
}
