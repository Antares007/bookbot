// @flow strict
import { delay, now } from './scheduler'
import * as D from './disposable'

export { delay, now }

export class End {}
export const end = new End()

export class S<A> {
  pith: ((A | Error | End | D.Disposable) => void) => void
  constructor(pith: $PropertyType<S<A>, 'pith'>) {
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
  flatMap<B>(f: A => S<B>): S<B> {
    return flatMap(f, this)
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
export function s<A>(pith: $PropertyType<S<A>, 'pith'>): S<A> {
  return new S(pith)
}

export const empty = <A>(): S<A> => s(o => o(delay(() => o(end))))

export const at = <A>(a: A, dly: number = 0): S<A> =>
  s(o => {
    o(
      delay(() => {
        o(a)
        o(delay(() => o(end), 0))
      }, dly)
    )
  })

export const periodic = (period: number): S<number> =>
  s(o => {
    var i = 0
    o(
      delay(function periodic() {
        o(i++)
        o(delay(periodic, period))
      })
    )
  })

export const run = <A>(
  o: (A | Error | End) => void,
  as: S<A>
): D.Disposable => {
  var disposables = []
  const disposable = D.disposable(() => {
    var d
    while ((d = disposables.shift())) d.dispose()
  })
  var tp = now()
  as.pith(function S$run(e) {
    if (e instanceof D.Disposable) {
      if (tp === now()) disposables.push(e)
      else {
        tp = now()
        disposables = [e]
      }
    } else {
      if (e instanceof Error) disposable.dispose()
      o(e)
    }
  })
  return disposable
}

export const switchLatest = <A>(Hs: S<S<A>>): S<A> =>
  s(o => {
    var Esd: ?D.Disposable = null
    var Hsd: ?D.Disposable = run(function S$switchLatestO(e) {
      if (e instanceof Error) o(e)
      else if (e instanceof End) {
        Hsd = null
        if (Esd == null) o(end)
      } else {
        Esd && Esd.dispose()
        Esd = run(function S$switchLatestI(e) {
          if (e instanceof End) {
            Esd = null
            if (Hsd == null) o(end)
          } else o(e)
        }, e)
      }
    }, Hs)
    o(
      D.disposable(() => {
        Hsd && Hsd.dispose()
        Esd && Esd.dispose()
      })
    )
  })

export const flatMap = <A, B>(f: A => S<B>, as: S<A>): S<B> =>
  s(o => {
    const dmap = new Map()
    o(
      D.disposable(() => {
        for (var e of dmap.entries()) e[1].dispose()
      })
    )
    var i = 0
    const index = i++
    dmap.set(
      index,
      run(e => {
        if (e instanceof Error) o(e)
        else if (e instanceof End) {
          dmap.delete(index)
          if (dmap.size === 0) o(e)
        } else {
          const index = i++
          dmap.set(
            index,
            run(e => {
              if (e instanceof Error) o(e)
              else if (e instanceof End) {
                dmap.delete(index)
                if (dmap.size === 0) o(e)
              } else if (e instanceof Error) o(e)
              else {
                o(e)
              }
            }, f(e))
          )
        }
      }, as)
    )
  })

export const combine = <A, B>(f: (Array<A>) => B, array: Array<S<A>>): S<B> =>
  s(o => {
    const dmap = new Map()
    const mas: Array<?A> = []
    for (var i = 0, l = array.length; i < l; i++) {
      mas.push(null)
      dmap.set(i, run(S$combine(i), array[i]))
    }
    o(
      D.disposable(() => {
        for (var e of dmap.entries()) e[1].dispose()
      })
    )
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
  s(o => {
    var i = 2
    const sad = run(S$merge, sa)
    const sbd = run(S$merge, sb)
    o(
      D.disposable(() => {
        sad.dispose()
        sbd.dispose()
      })
    )
    function S$merge(e) {
      if (e instanceof End) {
        --i === 0 && o(end)
      } else o(e)
    }
  })

export const startWith = <A>(a: A, as: S<A>): S<A> =>
  s(o => o(delay(() => o(a), o(run(o, as)))))

export const tryCatch = <A>(as: S<A>): S<A> =>
  s(o =>
    as.pith(function S$tryCatch(e) {
      if (e instanceof Error) o(e)
      else
        try {
          o(e)
        } catch (err) {
          o(err)
        }
    })
  )

export const map = <A, B>(f: A => B, as: S<A>): S<B> =>
  s(o =>
    as.pith(function S$map(e) {
      if (e instanceof Error || e instanceof End || e instanceof D.Disposable)
        o(e)
      else o(f(e))
    })
  )

export const filter = <A>(f: A => boolean, as: S<A>): S<A> =>
  s(o =>
    as.pith(function S$filter(e) {
      if (e instanceof Error || e instanceof End || e instanceof D.Disposable)
        o(e)
      else if (f(e)) o(e)
    })
  )

export const filter2 = <A, B>(f: A => ?B, as: S<A>): S<B> =>
  s(o =>
    as.pith(function S$filter(e) {
      if (e instanceof Error || e instanceof End || e instanceof D.Disposable)
        o(e)
      else {
        const b = f(e)
        if (b) o(b)
      }
    })
  )

export const take = <A>(n: number, as: S<A>): S<A> => {
  if (n <= 0) return empty()
  return s(o => {
    var i = 0
    const d = run(function S$take(e) {
      if (e instanceof Error || e instanceof End) o(e)
      else {
        o(e)
        if (++i === n) {
          d.dispose()
          o(end)
        }
      }
    }, as)
    o(d)
  })
}

export const skip = <A>(n: number, as: S<A>): S<A> => {
  if (n <= 0) return as
  return s(o => {
    var i = 0
    const d = run(function S$skip(e) {
      if (e instanceof Error || e instanceof End) o(e)
      else {
        if (i++ < n) return
        o(e)
      }
    }, as)
    o(d)
  })
}

export const scan = <A, B>(f: (B, A) => B, b: B, as: S<A>): S<B> => {
  return s(o => {
    o(
      delay(t => {
        var b_ = b
        o(b_)
        o(
          run(function S$scan(e) {
            if (e instanceof Error || e instanceof End) o(e)
            else o((b_ = f(b_, e)))
          }, as)
        )
      })
    )
  })
}
