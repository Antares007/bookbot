//@flow
import type { IO } from "./io"
import type { O } from "./scheduler"
import { Delay } from "./scheduler"
import type { Disposable } from "./disposable"
import * as disposable from "./disposable"

export opaque type S<A> = IO<(O) => Disposable, ?A | Error, Disposable>

export function run<A>(o: (?A | Error) => void, run: O => Disposable, s: S<A>) {
  return s(o)(run)
}

export function empty<A>(): S<A> {
  return o => run => disposable.empty
}

export function at<A>(t: number, a: A): S<A> {
  return o => run =>
    run(
      Delay(t)(_ => t => {
        try {
          o(a)
          o()
        } catch (exn) {
          exn instanceof Error ? o(exn) : o(new Error())
        }
      })
    )
}

export function fromArray<A>(xs: Array<A>): S<A> {
  return o => run =>
    run(
      Delay(0)(_ => t => {
        try {
          for (var i = 0, l = xs.length; i < l; i++) o(xs[i])
          o()
        } catch (exn) {
          exn instanceof Error ? o(exn) : o(new Error())
        }
      })
    )
}

export function now<A>(a: A): S<A> {
  return at<A>(0, a)
}

export function periodic(period: number): S<number> {
  return o => run => {
    var i = 0
    const p = so => t => {
      try {
        o(i++)
        so(Delay(period)(p))
      } catch (exn) {
        exn instanceof Error ? o(exn) : o(new Error())
      }
    }
    return run(Delay(0)(p))
  }
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return o => run =>
    s(v => (v == null || v instanceof Error ? o(v) : o(f(v))))(run)
}

export function filter<A>(f: A => boolean, s: S<A>): S<A> {
  return o => run =>
    s(v => (v == null || v instanceof Error ? o(v) : f(v) ? o(v) : void 0))(run)
}

export function take<A>(n: number, s: S<A>): S<A> {
  return o => run => {
    var i = 0
    const dispose = s(v => {
      i++
      if (i <= n) o(v)
      if (i >= n) {
        dispose()
        o()
      }
    })(run)
    return dispose
  }
}

export function mergeArray<A>(xs: Array<S<A>>): S<A> {
  return o => run => {
    var size = xs.length
    const dmap: { [number | string]: Disposable } = {}
    const dispose = disposable.rtrn(() => {
      for (var key in dmap) dmap[key]()
    })
    const oo = (key: number) => v => {
      if (v == null) {
        delete dmap[key]
        size--
        if (size === 0) o()
      } else if (v instanceof Error) {
        dispose()
        o(v)
      } else {
        o(v)
      }
    }
    for (var i = 0, l = xs.length; i < l; i++) dmap[i] = xs[i](oo(i))(run)
    return dispose
  }
}
