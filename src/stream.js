//@flow strict
import type { Scheduler } from "./scheduler.js"
import { local } from "./scheduler.js"

export type Sink<A> = {
  +event: (t: number, a: A) => void,
  +end: (t: number) => void,
  +error: (t: number, err: Error) => void
}
export type S<A> = (Sink<A>, Scheduler) => D

type D = { +dispose: () => void }
type CRef = { canceled: boolean }

export function createAt<A>(
  delay: number,
  f: (sink: Sink<A>, scheduler: Scheduler, t: number, cref: CRef) => ?D
): S<A> {
  const cref = { canceled: false }
  return (sink, scheduler) => {
    let d: ?D = null
    scheduler(delay, t => {
      if (cref.canceled) return
      try {
        d = f(sink, local(delay, scheduler), delay, cref)
      } catch (err) {
        sink.error(delay, err instanceof Error ? err : new Error(err + ""))
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
  return createAt(delay, (sink, scheduler, t, cref) => {
    sink.event(t, a)
    if (cref.canceled) return
    sink.end(t)
  })
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return (sink, scheduler) =>
    s(
      {
        event: (t, v) => sink.event(t, f(v)),
        end: sink.end,
        error: sink.error
      },
      scheduler
    )
}

export function fromArray<A>(as: Array<A>): S<A> {
  return createAt(0, (sink, scheduler, t, cref) => {
    for (let i = 0, l = as.length; i < l; i++) {
      sink.event(t, as[i])
      if (cref.canceled) return
    }
    sink.end(t)
  })
}

export function join<A>(scheduler: S<S<A>>): S<A> {
  return (sink, run) => {
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
    dmap[index] = scheduler(
      {
        event(t0, iS) {
          const index = i++
          size++
          dmap[index] = iS(
            {
              event(t1, v) {
                sink.event(t1 + t0, v)
              },
              end(t1) {
                delete dmap[index]
                if (--size === 0) sink.end(t1 + t0)
              },
              error(t1, err) {
                d.dispose()
                sink.error(t1 + t0, err)
              }
            },
            run
          )
        },
        end(t0) {
          delete dmap[index]
          if (--size === 0) sink.end(t0)
        },
        error(t0, err) {
          d.dispose()
          sink.error(t0, err)
        }
      },
      run
    )
    return d
  }
}

export function chain<A, B>(f: A => S<B>, xs: S<A>): S<B> {
  return (sink, run) => {
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
                sink.event(t1 + t0, v)
              },
              end(t1) {
                delete dmap[index]
                if (--size === 0) sink.end(t1 + t0)
              },
              error(t1, err) {
                d.dispose()
                sink.error(t1 + t0, err)
              }
            },
            run
          )
        },
        end(t0) {
          delete dmap[index]
          if (--size === 0) sink.end(t0)
        },
        error(t0, err) {
          d.dispose()
          sink.error(t0, err)
        }
      },
      run
    )
    return d
  }
}

// import type { IO } from "./io"
// import type { Sink } from "./scheduler"
// import { Delay, Origin } from "./scheduler"
// import type { D } from "./disposable"
// import * as disposable from "./disposable"
//
// export opaque type S<A> = (
//   (?A | Error, number) => void
// ) => ((Sink) => D) => D
//
// export function run<A>(
//   sink: (?A | Error, number) => void,
//   run: Sink => D,
//   s: S<A>
// ) {
//   return s(sink)(run)
// }
//
// export function empty<A>(): S<A> {
//   return sink => run => disposable.empty
// }
//
// export function at<A>(t: number, a: A): S<A> {
//   return sink => run =>
//     run(
//       Delay(t)(_ => t => {
//         try {
//           sink(a, t)
//           sink(null, t)
//         } catch (exn) {
//           exn instanceof Error ? sink(exn, t) : sink(new Error(), t)
//         }
//       })
//     )
// }
//
// export function fromArray<A>(xs: Array<A>): S<A> {
//   return sink => run =>
//     run(
//       Delay(0)(_ => t => {
//         try {
//           for (var i = 0, l = xs.length; i < l; i++) sink(xs[i], t)
//           sink(null, t)
//         } catch (exn) {
//           exn instanceof Error ? sink(exn, t) : sink(new Error(), t)
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
//   return sink => run => {
//     var d0 = disposable.empty
//     const d1 = run(
//       Origin(_ => t0 => {
//         const listener = (e: Event) => run(Origin(_ => t1 => sink(e, t1 - t0)))
//         et.addEventListener(event, listener)
//         d0 = disposable.rtrn(() => et.removeEventListener(event, listener))
//       })
//     )
//     return disposable.rtrn(() => (d0.dispose(), d1.dispose()))
//   }
// }
//
// export function periodic(period: number): S<number> {
//   return sink => run => {
//     var i = 0
//     const p = so => t => {
//       try {
//         sink(i++, t)
//         so(Delay(period)(p))
//       } catch (exn) {
//         exn instanceof Error ? sink(exn, t) : sink(new Error(), t)
//       }
//     }
//     return run(Delay(0)(p))
//   }
// }
//
// export function map<A, B>(f: A => B, s: S<A>): S<B> {
//   return sink => run =>
//     s((v, t) => {
//       if (v == null || v instanceof Error) sink(v, t)
//       else sink(f(v), t)
//     })(run)
// }
//
// export function tap<A>(f: A => void, s: S<A>): S<A> {
//   return sink => run =>
//     s((v, t) => {
//       if (v == null || v instanceof Error) sink(v, t)
//       else sink((f(v), v), t)
//     })(run)
// }
//
// export function filter<A>(f: A => boolean, s: S<A>): S<A> {
//   return sink => run =>
//     s((v, t) => {
//       if (v == null || v instanceof Error) sink(v, t)
//       else if (f(v)) sink(v, t)
//     })(run)
// }
//
// export function take<A>(n: number, s: S<A>): S<A> {
//   return sink => run => {
//     var i = 0
//     const d = s((v, t) => {
//       i++
//       if (i <= n) sink(v, t)
//       if (i >= n) {
//         d.dispose()
//         sink(null, t)
//       }
//     })(run)
//     return d
//   }
// }
//
// export function mergeArray<A>(xs: Array<S<A>>): S<A> {
//   return sink => run => {
//     var size = xs.length
//     const dmap: { [number | string]: D } = {}
//     const d = disposable.rtrn(() => {
//       for (var key in dmap) dmap[key].dispose()
//     })
//     const oo = (key: number) => (v, t) => {
//       if (v == null) {
//         delete dmap[key]
//         size--
//         if (size === 0) sink(null, t)
//       } else {
//         if (v instanceof Error) d.dispose()
//         sink(v, t)
//       }
//     }
//     for (var i = 0, l = xs.length; i < l; i++) dmap[i] = xs[i](oo(i))(run)
//     return d
//   }
// }
//
//
