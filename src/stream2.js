// @flow strict
import { delay, now } from './scheduler2'

export type S$pith<A> = {
  t: 'S$pith',
  pith: ((A | Error | TheEnd) => void) => { dispose: () => void }
}

class TheEnd {}
const end = new TheEnd()

const pith = <A>(pith: $PropertyType<S$pith<A>, 'pith'>): S$pith<A> => ({
  t: 'S$pith',
  pith: pith
})

export const empty = {
  t: 'S$pith',
  pith: (o: TheEnd => void) => delay(() => o(end))
}

export const at = <A>(a: A, dly: number = 0): S$pith<A> => ({
  t: 'S$pith',
  pith: o => {
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
  }
})

export const periodic = (period: number): S$pith<number> => ({
  t: 'S$pith',
  pith: o => {
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
  }
})

export const run = <A>(
  o: (A | Error | TheEnd) => void,
  s: S$pith<A>
): { dispose: () => void } => {
  var disposed = false
  const d = s.pith(e => {
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
type Disposable = { dispose: () => void }

export const switchLatest = <A>(Hs: S$pith<S$pith<A>>): S$pith<A> => {
  return {
    t: 'S$pith',
    pith: o => {
      var Esd: ?Disposable = null
      var Hsd: ?Disposable = Hs.pith(e => {
        if (e instanceof Error) o(e)
        else if (e instanceof TheEnd) {
          Hsd = null
          if (Esd == null) o(end)
        } else {
          Esd && Esd.dispose()
          Esd = e.pith(e => {
            if (e instanceof Error) return o(e)
            if (e instanceof TheEnd) {
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
    }
  }
}

export const combine = <A, B>(
  f: (Array<A>) => B,
  array: Array<S$pith<A>>
): S$pith<B> => {
  return {
    t: 'S$pith',
    pith: o => {
      const dmap = new Map()
      const mas: Array<?A> = []
      for (var i = 0, l = array.length; i < l; i++) {
        mas.push(null)
        dmap.set(i, array[i].pith(ring(i)))
      }
      return {
        dispose() {
          for (var e of dmap.entries()) e[1].dispose()
        }
      }
      function ring(index) {
        return e => {
          if (e instanceof Error) o(e)
          else if (e instanceof TheEnd) {
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
    }
  }
}

export const merge = <A, B>(sa: S$pith<A>, sb: S$pith<B>): S$pith<A | B> => {
  return {
    t: 'S$pith',
    pith: o => {
      var i = 2
      const sad = sa.pith(merge)
      const sbd = sb.pith(merge)
      return {
        dispose() {
          sad.dispose()
          sbd.dispose()
        }
      }
      function merge(e) {
        if (e instanceof TheEnd) {
          --i === 0 && o(end)
        } else o(e)
      }
    }
  }
}

export const startWith = <A>(a: A, s: S$pith<A>): S$pith<A> => {
  return {
    t: 'S$pith',
    pith: o => {
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
    }
  }
}

export const tryCatch = <A>(s: S$pith<A>): S$pith<A> => ({
  t: 'S$pith',
  pith: o =>
    s.pith(e => {
      if (e instanceof Error) o(e)
      else
        try {
          o(e)
        } catch (err) {
          o(err)
        }
    })
})

export const map = <A, B>(f: A => B, s: S$pith<A>): S$pith<B> => ({
  t: 'S$pith',
  pith: o =>
    s.pith(e => {
      if (e instanceof Error || e instanceof TheEnd) o(e)
      else o(f(e))
    })
})

export const take = <A>(n: number, s: S$pith<A>): S$pith<A> => {
  if (n <= 0) return empty
  return {
    t: 'S$pith',
    pith: (o, schdlr) => {
      var i = 0
      const d = s.pith(e => {
        if (e instanceof Error || e instanceof TheEnd) o(e)
        else {
          o(e)
          if (++i === n) {
            d.dispose()
            o(end)
          }
        }
      })
      return d
    }
  }
}

export const skip = <A>(n: number, s: S$pith<A>): S$pith<A> => {
  if (n <= 0) return s
  return {
    t: 'S$pith',
    pith: (o, schdlr) => {
      var i = 0
      const d = s.pith(e => {
        if (e instanceof Error || e instanceof TheEnd) o(e)
        else {
          if (i++ < n) return
          o(e)
        }
      })
      return d
    }
  }
}

export const scan = <A, B>(f: (B, A) => B, b: B, s: S$pith<A>): S$pith<B> => {
  return {
    t: 'S$pith',
    pith: o => {
      var active = true
      var d = delay(t => {
        var b_ = b
        o(b_)
        if (active)
          d = s.pith(e => {
            if (e instanceof Error || e instanceof TheEnd) o(e)
            else o((b_ = f(b_, e)))
          })
      })
      return {
        dispose() {
          active = false
          d.dispose()
        }
      }
    }
  }
}
