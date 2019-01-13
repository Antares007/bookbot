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
    s(v => {
      if (v == null || v instanceof Error) o(v)
      else o(f(v))
    })(run)
}

export function tap<A>(f: A => void, s: S<A>): S<A> {
  return o => run =>
    s(v => {
      if (v == null || v instanceof Error) o(v)
      else o((f(v), v))
    })(run)
}

export function filter<A>(f: A => boolean, s: S<A>): S<A> {
  return o => run =>
    s(v => {
      if (v == null || v instanceof Error) o(v)
      else if (f(v)) o(v)
    })(run)
}

export function take<A>(n: number, s: S<A>): S<A> {
  return o => run => {
    var i = 0
    const d = s(v => {
      i++
      if (i <= n) o(v)
      if (i >= n) {
        d.dispose()
        o()
      }
    })(run)
    return d
  }
}

export function mergeArray<A>(xs: Array<S<A>>): S<A> {
  return o => run => {
    var size = xs.length
    const dmap: { [number | string]: Disposable } = {}
    const d = disposable.rtrn(() => {
      for (var key in dmap) dmap[key].dispose()
    })
    const oo = (key: number) => v => {
      if (v == null) {
        delete dmap[key]
        size--
        if (size === 0) o()
      } else if (v instanceof Error) {
        d.dispose()
        o(v)
      } else {
        o(v)
      }
    }
    for (var i = 0, l = xs.length; i < l; i++) dmap[i] = xs[i](oo(i))(run)
    return d
  }
}

export function join<A>(xs: S<S<A>>): S<A> {
  return o => run => {
    var i = 0
    var size = 0
    const dmap: { [number | string]: Disposable } = {}
    const d = disposable.rtrn(() => {
      for (var key in dmap) dmap[key].dispose()
    })
    const index = i++
    size++
    dmap[index] = xs(v => {
      if (v == null) delete dmap[index], --size === 0 ? o() : void 0
      else if (v instanceof Error) d.dispose(), o(v)
      else {
        const index = i++
        size++
        dmap[index] = v(v => {
          if (v == null) delete dmap[index], --size === 0 ? o() : void 0
          else if (v instanceof Error) d.dispose(), o(v)
          else o(v)
        })(run)
      }
    })(run)
    return d
  }
}

export function chain<A, B>(f: A => S<B>, s: S<A>): S<B> {
  return join(map(f, s))
}
