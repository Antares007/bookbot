//flow strict
import type { Schedule, O as So } from "./scheduler.js"

export type O<A> = (a: ?A | Error, t: number) => void
export type S<A> = (O<A>, So) => D

type D = { +dispose: () => void }
type CRef = { canceled: boolean }

export function create<A>(
  f: (o: O<A>, oS: So, t: number, cref: CRef) => ?D
): S<A> {
  const cref = { canceled: false }
  return (o, oS) => {
    let d: ?D = null
    oS(0, (oS, t) => {
      if (cref.canceled) return
      d = f(o, oS, 0, cref)
    })
    return {
      dispose() {
        cref.canceled = true
        if (d != null) d.dispose()
      }
    }
  }
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return (o, run) =>
    s((v, t) => {
      if (v == null || v instanceof Error) return o(v, t)
      o(f(v), t)
    }, run)
}

const e = create((o, oS, t, cref) => {
  try {
    o(1, t)
    if (cref.canceled) return
    o(null, t)
  } catch (err) {
    if (err instanceof Error) return o(err, t)
    throw err
  }
})

export const empty: S<empty> = (o, scheduler) => {
  let canceled = false
  scheduler((os, t0) =>
    os(0, (_, t) => {
      if (canceled) return
      const now = t - t0
      try {
        o(null, now)
      } catch (err) {
        if (err instanceof Error) return o(err, now)
        throw err
      }
    })
  )
  return {
    dispose() {
      canceled = true
    }
  }
}
export function at<A>(a: A, delay: number): S<A> {
  return (o, scheduler) => {
    let canceled = false
    scheduler((os, t0) =>
      os(delay, (_, t) => {
        if (canceled) return
        const now = t - t0
        try {
          o(a, now)
          if (canceled) return
          o(null, now)
        } catch (err) {
          if (err instanceof Error) return o(err, now)
          throw err
        }
      })
    )
    return {
      dispose() {
        canceled = true
      }
    }
  }
}

export function fromArray<A>(as: Array<A>): S<A> {
  return (o, scheduler) => {
    let canceled = false
    scheduler((os, t0) =>
      os(0, (_, t) => {
        if (canceled) return
        const now = t - t0
        try {
          for (let a of as) {
            o(a, now)
            if (canceled) return
          }
          o(null, now)
        } catch (err) {
          if (err instanceof Error) return o(err, now)
          o(new Error(err + ""), now)
        }
      })
    )
    return {
      dispose() {
        canceled = true
      }
    }
  }
}

export function reduce<A, B>(f: (B, A) => B, b: B, s: S<A>): S<B> {
  let _b = b
  return (o, schedule) =>
    s((v, t) => {
      if (v == null) return o(_b, t), o(null, t)
      if (v instanceof Error) return o(v, t)
      _b = f(_b, v)
    }, schedule)
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
    dmap[index] = xs((v, t0) => {
      if (v == null) {
        delete dmap[index]
        if (--size === 0) o(null, t0)
      } else if (v instanceof Error) {
        d.dispose()
        o(v, t0)
      } else {
        const index = i++
        size++
        dmap[index] = v((v, t1) => {
          if (v == null) {
            delete dmap[index]
            if (--size === 0) o(null, t0 + t1)
          } else {
            if (v instanceof Error) d.dispose()
            o(v, t0 + t1)
          }
        }, run)
      }
    }, run)
    return d
  }
}

export function chain<A, B>(f: A => S<B>, s: S<A>): S<B> {
  return join(map(f, s))
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
