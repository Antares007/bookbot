//@flow strict
import type { Schedule, O as So } from "./scheduler.js"

export type O<A> = {
  +event: (a: A, t: number) => void,
  +end: (x: null, t: number) => void,
  +error: (err: Error, t: number) => void
}
export type S<A> = (O<A>, So) => D

type D = { +dispose: () => void }
type CRef = { canceled: boolean }

export function createAt<A>(
  delay: number,
  f: (o: O<A>, oS: So, t: number, cref: CRef) => ?D
): S<A> {
  const cref = { canceled: false }
  return (o, oS) => {
    let d: ?D = null
    oS(delay, t => {
      const offset = delay - t
      if (cref.canceled) return
      d = f(
        o,
        (a, b) => {
          if (typeof a === "number" && typeof b === "function") {
            oS(a, t => b(t + offset))
          } else {
            if (typeof a === "function") oS(t => a(t + offset))
            if (typeof b === "function") oS(t => b(t + offset))
          }
        },
        delay,
        cref
      )
    })
    return {
      dispose() {
        cref.canceled = true
        if (d != null) d.dispose()
      }
    }
  }
}

export function at<A>(a: A, delay: number): S<A> {
  return createAt(delay, (o, oS, t, cref) => {
    try {
      o.event(a, t)
      if (cref.canceled) return
      o.end(null, t)
    } catch (err) {
      if (err instanceof Error) return o.error(err, t)
      throw err
    }
  })
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return (o, oS) =>
    s(
      {
        event(v, t) {
          o.event(f(v), t)
        },
        end: o.end,
        error: o.error
      },
      oS
    )
}

export function fromArray<A>(as: Array<A>): S<A> {
  return createAt(0, (o, oS, t, cref) => {
    try {
      for (let i = 0, l = as.length; i < l; i++) {
        o.event(as[i], t)
        if (cref.canceled) return
      }
      o.end(null, t)
    } catch (err) {
      o.error(err instanceof Error ? err : new Error(err + ""), t)
    }
  })
}

export function join<A>(xs: S<S<A>>): S<A> {
  return (o, run) => {
    var i = 0
    var size = 0
    const dmap: { [number | string]: { +dispose: () => void } } = {}
    const d = {
      dispose() {
        for (var key in dmap) dmap[key].dispose()
      }
    }
    const index = i++
    size++
    dmap[index] = xs(
      {
        event(v, t0) {
          const index = i++
          size++
          dmap[index] = v(
            {
              event(v, t1) {
                o.event(v, t1 + t0)
              },
              end(_, t1) {
                delete dmap[index]
                if (--size === 0) o.end(null, t1 + t0)
              },
              error(err, t1) {
                d.dispose()
                o.error(err, t1 + t0)
              }
            },
            run
          )
        },
        end(_, t0) {
          delete dmap[index]
          if (--size === 0) o.end(null, t0)
        },
        error(err, t0) {
          d.dispose()
          o.error(err, t0)
        }
      },
      run
    )
    return d
  }
}

export function chain<A, B>(f: A => S<B>, xs: S<A>): S<B> {
  return (o, run) => {
    var i = 0
    var size = 0
    const dmap: { [number | string]: { +dispose: () => void } } = {}
    const d = {
      dispose() {
        for (var key in dmap) dmap[key].dispose()
      }
    }
    const index = i++
    size++
    dmap[index] = xs(
      {
        event(v, t0) {
          const index = i++
          size++
          dmap[index] = f(v)(
            {
              event(v, t1) {
                o.event(v, t1 + t0)
              },
              end(_, t1) {
                delete dmap[index]
                if (--size === 0) o.end(null, t1 + t0)
              },
              error(err, t1) {
                d.dispose()
                o.error(err, t1 + t0)
              }
            },
            run
          )
        },
        end(_, t0) {
          delete dmap[index]
          if (--size === 0) o.end(null, t0)
        },
        error(err, t0) {
          d.dispose()
          o.error(err, t0)
        }
      },
      run
    )
    return d
  }
}

// import type { IO } from "./io"
// import type { O } from "./scheduler"
// import { Delay, Origin } from "./scheduler"
// import type { D } from "./disposable"
// import * as disposable from "./disposable"
//
// export opaque type S<A> = (
//   (?A | Error, number) => void
// ) => ((O) => D) => D
//
// export function run<A>(
//   o: (?A | Error, number) => void,
//   run: O => D,
//   s: S<A>
// ) {
//   return s(o)(run)
// }
//
// export function empty<A>(): S<A> {
//   return o => run => disposable.empty
// }
//
// export function at<A>(t: number, a: A): S<A> {
//   return o => run =>
//     run(
//       Delay(t)(_ => t => {
//         try {
//           o(a, t)
//           o(null, t)
//         } catch (exn) {
//           exn instanceof Error ? o(exn, t) : o(new Error(), t)
//         }
//       })
//     )
// }
//
// export function fromArray<A>(xs: Array<A>): S<A> {
//   return o => run =>
//     run(
//       Delay(0)(_ => t => {
//         try {
//           for (var i = 0, l = xs.length; i < l; i++) o(xs[i], t)
//           o(null, t)
//         } catch (exn) {
//           exn instanceof Error ? o(exn, t) : o(new Error(), t)
//         }
//       })
//     )
// }
//
// export function now<A>(a: A): S<A> {
//   return at<A>(0, a)
// }
//
// export function on(event: string, et: EventTarget): S<Event> {
//   return o => run => {
//     var d0 = disposable.empty
//     const d1 = run(
//       Origin(_ => t0 => {
//         const listener = (e: Event) => run(Origin(_ => t1 => o(e, t1 - t0)))
//         et.addEventListener(event, listener)
//         d0 = disposable.rtrn(() => et.removeEventListener(event, listener))
//       })
//     )
//     return disposable.rtrn(() => (d0.dispose(), d1.dispose()))
//   }
// }
//
// export function periodic(period: number): S<number> {
//   return o => run => {
//     var i = 0
//     const p = so => t => {
//       try {
//         o(i++, t)
//         so(Delay(period)(p))
//       } catch (exn) {
//         exn instanceof Error ? o(exn, t) : o(new Error(), t)
//       }
//     }
//     return run(Delay(0)(p))
//   }
// }
//
// export function map<A, B>(f: A => B, s: S<A>): S<B> {
//   return o => run =>
//     s((v, t) => {
//       if (v == null || v instanceof Error) o(v, t)
//       else o(f(v), t)
//     })(run)
// }
//
// export function tap<A>(f: A => void, s: S<A>): S<A> {
//   return o => run =>
//     s((v, t) => {
//       if (v == null || v instanceof Error) o(v, t)
//       else o((f(v), v), t)
//     })(run)
// }
//
// export function filter<A>(f: A => boolean, s: S<A>): S<A> {
//   return o => run =>
//     s((v, t) => {
//       if (v == null || v instanceof Error) o(v, t)
//       else if (f(v)) o(v, t)
//     })(run)
// }
//
// export function take<A>(n: number, s: S<A>): S<A> {
//   return o => run => {
//     var i = 0
//     const d = s((v, t) => {
//       i++
//       if (i <= n) o(v, t)
//       if (i >= n) {
//         d.dispose()
//         o(null, t)
//       }
//     })(run)
//     return d
//   }
// }
//
// export function mergeArray<A>(xs: Array<S<A>>): S<A> {
//   return o => run => {
//     var size = xs.length
//     const dmap: { [number | string]: D } = {}
//     const d = disposable.rtrn(() => {
//       for (var key in dmap) dmap[key].dispose()
//     })
//     const oo = (key: number) => (v, t) => {
//       if (v == null) {
//         delete dmap[key]
//         size--
//         if (size === 0) o(null, t)
//       } else {
//         if (v instanceof Error) d.dispose()
//         o(v, t)
//       }
//     }
//     for (var i = 0, l = xs.length; i < l; i++) dmap[i] = xs[i](oo(i))(run)
//     return d
//   }
// }
//
//
