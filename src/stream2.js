// @flow strict
import { delay, now } from './scheduler2'

export opaque type S$pith<A> = {
  t: 'S$pith',
  a: ((?A | Error) => void) => { dispose: () => void }
}

const pith = <A>(a: $PropertyType<S$pith<A>, 'a'>): S$pith<A> => ({
  t: 'S$pith',
  a
})

export const at = <A>(a: A, dly: number = 0): S$pith<A> => ({
  t: 'S$pith',
  a: o => {
    var active = true
    const d = delay(() => {
      o(a)
      if (active) o()
    }, dly)
    return {
      dispose() {
        active = false
        d.dispose()
      }
    }
  }
})

export const run = <A>(
  o: (?A | Error) => void,
  s: S$pith<A>
): { dispose: () => void } => {
  var disposed = false
  const d = s.a(e => {
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
    a: o => {
      var Esd: ?Disposable = null
      var Hsd: ?Disposable = Hs.a(e => {
        if (e instanceof Error) o(e)
        else if (e == null) {
          Hsd = null
          if (Esd == null) o()
        } else {
          Esd && Esd.dispose()
          Esd = e.a(e => {
            if (e instanceof Error) return o(e)
            if (e == null) {
              Esd = null
              if (Hsd == null) o()
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
    a: o => {
      const dmap = new Map()
      const mas: Array<?A> = []
      for (var i = 0, l = array.length; i < l; i++) {
        mas.push(null)
        dmap.set(i, array[i].a(ring(i)))
      }
      return {
        dispose() {
          for (var e of dmap.entries()) e[1].dispose()
        }
      }
      function ring(index) {
        return e => {
          if (e instanceof Error) o(e)
          else if (e == null) {
            dmap.delete(index)
            if (dmap.size === 0) o()
          } else {
            mas[index] = e
            var as = []
            for (var a of mas) {
              if (a == null) return
              as.push(a)
            }
            try {
              o(f(as))
            } catch (err) {
              o(err)
            }
          }
        }
      }
    }
  }
}

export const map = <A, B>(f: A => B, s: S$pith<A>): S$pith<B> => ({
  t: 'S$pith',
  a: o =>
    s.a(e => {
      if (e instanceof Error || e == null) o(e)
      else
        try {
          o(f(e))
        } catch (err) {
          o(err)
        }
    })
})

export const scan = <A, B>(f: (B, A) => B, b: B, s: S$pith<A>): S$pith<B> => {
  return {
    t: 'S$pith',
    a: o => {
      var b_ = b
      var d = delay(t => {
        d = s.a(e => {
          if (e instanceof Error || e == null) o(e)
          else {
            try {
              o((b_ = f(b_, e)))
            } catch (err) {
              o(err)
            }
          }
        })
      })
      return {
        dispose() {
          d.dispose()
        }
      }
    }
  }
}
