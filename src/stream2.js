// @flow strict
import { delay, now } from './scheduler2'

type Disposable = { dispose: () => void }

class End {}
const end = new End()

export const empty = <A>(): S<A> => new S(o => delay(() => o(end)))

export const at = <A>(a: A, dly: number = 0): S<A> =>
  new S(o => {
    var active = true
    const d = delay(() => {
      o(a)
      if (active) o(end)
    }, dly)
    return {
      dispose() {
        active = false
        d.dispose()
      }
    }
  })

export const periodic = (period: number): S<number> =>
  new S(o => {
    var active = true
    var i = 0
    var d = delay(function periodic() {
      o(i++)
      if (active) d = delay(periodic, period)
    }, 0)
    return {
      dispose() {
        active = false
        d.dispose()
      }
    }
  })

export const run = <A>(
  o: (A | Error | End) => void,
  s: S<A>
): { dispose: () => void } => {
  var disposed = false
  const d = s.pith(function S$run(e) {
    if (e instanceof Error) {
      disposed = true
      d.dispose()
    }
    o(e)
  })
  return {
    dispose() {
      if (disposed) return
      disposed = true
      d.dispose()
    }
  }
}

export const switchLatest = <A>(Hs: S<S<A>>): S<A> =>
  new S(o => {
    var Esd: ?Disposable = null
    var Hsd: ?Disposable = Hs.pith(function S$switchLatestO(e) {
      if (e instanceof Error) o(e)
      else if (e instanceof End) {
        Hsd = null
        if (Esd == null) o(end)
      } else {
        Esd && Esd.dispose()
        Esd = e.pith(function S$switchLatestI(e) {
          if (e instanceof End) {
            Esd = null
            if (Hsd == null) o(end)
          } else o(e)
        })
      }
    })
    return {
      dispose() {
        Hsd && Hsd.dispose()
        Esd && Esd.dispose()
      }
    }
  })

export const combine = <A, B>(f: (Array<A>) => B, array: Array<S<A>>): S<B> =>
  new S(o => {
    const dmap = new Map()
    const mas: Array<?A> = []
    for (var i = 0, l = array.length; i < l; i++) {
      mas.push(null)
      dmap.set(i, array[i].pith(S$combine(i)))
    }
    return {
      dispose() {
        for (var e of dmap.entries()) e[1].dispose()
      }
    }
    function S$combine(index) {
      return e => {
        if (e instanceof Error) o(e)
        else if (e instanceof End) {
          dmap.delete(index)
          if (dmap.size === 0) o(end)
        } else {
          mas[index] = e
          var as = []
          for (var a of mas) {
            if (a == null) return
            as.push(a)
          }
          o(f(as))
        }
      }
    }
  })

export const merge = <A, B>(sa: S<A>, sb: S<B>): S<A | B> =>
  new S(o => {
    var i = 2
    const sad = sa.pith(S$merge)
    const sbd = sb.pith(S$merge)
    return {
      dispose() {
        sad.dispose()
        sbd.dispose()
      }
    }
    function S$merge(e) {
      if (e instanceof End) {
        --i === 0 && o(end)
      } else o(e)
    }
  })

export const startWith = <A>(a: A, s: S<A>): S<A> =>
  new S(o => {
    var active = true
    var d = delay(() => {
      o(a)
      if (active) d = s.pith(o)
    })
    return {
      dispose() {
        active = false
        d.dispose()
      }
    }
  })

export const tryCatch = <A>(s: S<A>): S<A> =>
  new S(o =>
    s.pith(function S$tryCatch(e) {
      if (e instanceof Error) o(e)
      else
        try {
          o(e)
        } catch (err) {
          o(err)
        }
    })
  )

export const map = <A, B>(f: A => B, s: S<A>): S<B> =>
  new S(o =>
    s.pith(function S$map(e) {
      if (e instanceof Error || e instanceof End) o(e)
      else o(f(e))
    })
  )

export const filter = <A>(f: A => boolean, s: S<A>): S<A> =>
  new S(o =>
    s.pith(function S$filter(e) {
      if (e instanceof Error || e instanceof End) o(e)
      else if (f(e)) o(e)
    })
  )

export const filter2 = <A, B>(f: A => ?B, s: S<A>): S<B> =>
  new S(o =>
    s.pith(function S$filter(e) {
      if (e instanceof Error || e instanceof End) o(e)
      else {
        const b = f(e)
        if (b) o(b)
      }
    })
  )

export const take = <A>(n: number, s: S<A>): S<A> => {
  if (n <= 0) return empty()
  return new S(o => {
    var i = 0
    const d = s.pith(function S$take(e) {
      if (e instanceof Error || e instanceof End) o(e)
      else {
        o(e)
        if (++i === n) {
          d.dispose()
          o(end)
        }
      }
    })
    return d
  })
}

export const skip = <A>(n: number, s: S<A>): S<A> => {
  if (n <= 0) return s
  return new S(o => {
    var i = 0
    const d = s.pith(function S$skip(e) {
      if (e instanceof Error || e instanceof End) o(e)
      else {
        if (i++ < n) return
        o(e)
      }
    })
    return d
  })
}

export const scan = <A, B>(f: (B, A) => B, b: B, s: S<A>): S<B> => {
  return new S(o => {
    var active = true
    var d = delay(t => {
      var b_ = b
      o(b_)
      if (active)
        d = s.pith(function S$scan(e) {
          if (e instanceof Error || e instanceof End) o(e)
          else o((b_ = f(b_, e)))
        })
    })
    return {
      dispose() {
        active = false
        d.dispose()
      }
    }
  })
}

export class S<A> {
  pith: ((A | Error | End) => void) => { dispose: () => void }
  constructor(pith: ((A | Error | End) => void) => { dispose: () => void }) {
    this.pith = pith
  }
  run(o: (A | End | Error) => void) {
    return run(o, this)
  }
  merge<B>(sb: S<B>): S<A | B> {
    return merge(this, sb)
  }
  startWith(a: A): S<A> {
    return startWith(a, this)
  }
  tryCatch(): S<A> {
    return tryCatch(this)
  }
  map<B>(f: A => B): S<B> {
    return map(f, this)
  }
  filter(f: A => boolean): S<A> {
    return filter(f, this)
  }
  filter2<B>(f: A => ?B): S<B> {
    return filter2(f, this)
  }
  take(n: number): S<A> {
    return take(n, this)
  }
  skip(n: number): S<A> {
    return skip(n, this)
  }
  scan<B>(f: (B, A) => B, b: B): S<B> {
    return scan(f, b, this)
  }
}
