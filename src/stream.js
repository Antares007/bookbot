//@flow strict
import type { Schedule, O as So } from "./scheduler.js"
import { local } from "./scheduler.js"

export type O<A> = {
  +event: (t: number, a: A) => void,
  +end: (t: number) => void,
  +error: (t: number, err: Error) => void
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
      if (cref.canceled) return
      try {
        d = f(o, local(delay, oS), delay, cref)
      } catch (err) {
        o.error(delay, err instanceof Error ? err : new Error(err + ""))
      }
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
    o.event(t, a)
    if (cref.canceled) return
    o.end(t)
  })
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return (o, oS) =>
    s(
      {
        event: (t, v) => o.event(t, f(v)),
        end: o.end,
        error: o.error
      },
      oS
    )
}

export function fromArray<A>(as: Array<A>): S<A> {
  return createAt(0, (o, oS, t, cref) => {
    for (let i = 0, l = as.length; i < l; i++) {
      o.event(t, as[i])
      if (cref.canceled) return
    }
    o.end(t)
  })
}

export function join<A>(oS: S<S<A>>): S<A> {
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
    dmap[index] = oS(
      {
        event(t0, iS) {
          const index = i++
          size++
          dmap[index] = iS(
            {
              event(t1, v) {
                o.event(t1 + t0, v)
              },
              end(t1) {
                delete dmap[index]
                if (--size === 0) o.end(t1 + t0)
              },
              error(t1, err) {
                d.dispose()
                o.error(t1 + t0, err)
              }
            },
            run
          )
        },
        end(t0) {
          delete dmap[index]
          if (--size === 0) o.end(t0)
        },
        error(t0, err) {
          d.dispose()
          o.error(t0, err)
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
        event(t0, v) {
          const index = i++
          size++
          dmap[index] = f(v)(
            {
              event(t1, v) {
                o.event(t1 + t0, v)
              },
              end(t1) {
                delete dmap[index]
                if (--size === 0) o.end(t1 + t0)
              },
              error(t1, err) {
                d.dispose()
                o.error(t1 + t0, err)
              }
            },
            run
          )
        },
        end(t0) {
          delete dmap[index]
          if (--size === 0) o.end(t0)
        },
        error(t0, err) {
          d.dispose()
          o.error(t0, err)
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
