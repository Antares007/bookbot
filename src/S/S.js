// @flow strict
import type { Pith } from '../pith'
import { delay, now } from './scheduler'
import * as D from './Disposable'

export { delay, now }

export class End {}
export const end = new End()

export class Next<+A> {
  +value: A
  constructor(value: A) {
    this.value = value
  }
}
export const next = <A>(a: A): Next<A> => new Next(a)

export class S<A> {
  f: Pith<Next<A> | Error | End | D.Disposable, void, void>
  constructor(f: $PropertyType<S<A>, 'f'>) {
    this.f = f
  }
  run(o: (Next<A> | End | Error) => void) {
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
  tap(f: A => void): S<A> {
    return tap(f, this)
  }
  flatMap<B>(f: A => S<B>): S<B> {
    return flatMap(f, this)
  }
  flatMapLatest<B>(f: A => S<B>): S<B> {
    return flatMapLatest(f, this)
  }
  filter(f: A => boolean): S<A> {
    return filter(f, this)
  }
  filterJust<B>(f: A => ?B): S<B> {
    return filterJust(f, this)
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
  multicast(): S<A> {
    return multicast(this)
  }
  skipEquals(): S<A> {
    return skipEquals(this)
  }
  skipUntil<U>(us: S<U>): S<A> {
    return skipUntil(us, this)
  }
}
export function s<A>(f: $PropertyType<S<A>, 'f'>): S<A> {
  return new S(f)
}

export const empty = <A>(): S<A> => s(o => o(delay(() => o(end))))

export const d = <A>(a: A, dly: number = 0): S<A> =>
  s(o => {
    o(
      delay(() => {
        o(next(a))
        o(delay(() => o(end), 0))
      }, dly)
    )
  })

export const periodic = (period: number): S<number> =>
  s(o => {
    var i = 0
    o(
      delay(function periodic() {
        o(next(i++))
        o(delay(periodic, period))
      })
    )
  })

export const run = <A>(o: (Next<A> | Error | End) => void, as: S<A>): D.Disposable => {
  var disposables = []
  var disposed = false
  const disposable = D.create(() => {
    if (disposed) return
    disposed = true
    for (var d of disposables) d.dispose()
  })
  var tp = now()
  as.f(function S$run(e) {
    if (e instanceof Next) o(e)
    else if (e instanceof D.Disposable) {
      if (disposed) e.dispose()
      else if (tp === now()) disposables.push(e)
      else (tp = now()), (disposables = [e])
    } else {
      if (e instanceof Error) disposable.dispose()
      else disposables = []
      o(e)
    }
  })
  return disposable
}

export const flatMapLatest = <A, B>(f: A => S<B>, as: S<A>): S<B> =>
  s(o => {
    var esd: ?D.Disposable = null
    var ssd: ?D.Disposable = run(function S$flatMapLatestO(es) {
      if (es instanceof Next) {
        esd && esd.dispose()
        esd = run(function S$flatMapLatestI(e) {
          if (e instanceof Next) o(e)
          else if (e instanceof End) {
            esd = null
            if (ssd == null) o(end)
          } else o(e)
        }, f(es.value))
      } else if (es instanceof End) {
        ssd = null
        if (esd == null) o(end)
      } else o(es)
    }, as)
    o(
      D.create(() => {
        ssd && ssd.dispose()
        esd && esd.dispose()
      })
    )
  })

export const switchLatest = <A>(ss: S<S<A>>): S<A> =>
  s(o => {
    var esd: ?D.Disposable = null
    var ssd: ?D.Disposable = run(function S$switchLatestO(es) {
      if (es instanceof Next) {
        esd && esd.dispose()
        esd = run(function S$switchLatestI(e) {
          if (e instanceof Next) o(e)
          else if (e instanceof End) {
            esd = null
            if (ssd == null) o(end)
          } else o(e)
        }, es.value)
      } else if (es instanceof End) {
        ssd = null
        if (esd == null) o(end)
      } else o(es)
    }, ss)
    o(
      D.create(() => {
        ssd && ssd.dispose()
        esd && esd.dispose()
      })
    )
  })

export const flatMap = <A, B>(f: A => S<B>, as: S<A>): S<B> =>
  s(o => {
    const dmap = new Map()
    o(
      D.create(() => {
        for (var e of dmap.entries()) e[1].dispose()
      })
    )
    var i = 0
    const index = i++
    dmap.set(
      index,
      run(e => {
        if (e instanceof Next) {
          const index = i++
          dmap.set(
            index,
            run(e => {
              if (e instanceof Next) o(e)
              else if (e instanceof End) {
                dmap.delete(index)
                if (dmap.size === 0) o(e)
              } else o(e)
            }, f(e.value))
          )
        } else if (e instanceof End) {
          dmap.delete(index)
          if (dmap.size === 0) o(e)
        } else o(e)
      }, as)
    )
  })

export const combine = <A, B>(f: (Array<A>) => B, array: Array<S<A>>): S<B> =>
  s(o => {
    const dmap = new Map()
    const mas: Array<?Next<A>> = []
    for (var i = 0, l = array.length; i < l; i++) {
      mas.push(null)
      dmap.set(i, run(S$combine(i), array[i]))
    }
    o(
      D.create(() => {
        for (var e of dmap.entries()) e[1].dispose()
      })
    )
    function S$combine(index) {
      return e => {
        if (e instanceof Next) {
          mas[index] = e
          var as = []
          for (var a of mas) {
            if (a == null) return
            as.push(a.value)
          }
          o(next(f(as)))
        } else if (e instanceof End) {
          dmap.delete(index)
          if (dmap.size === 0) o(end)
        } else o(e)
      }
    }
  })

export const merge = <A, B>(sa: S<A>, sb: S<B>): S<A | B> =>
  s(o => {
    var i = 2
    const sad = run(S$merge, sa)
    const sbd = run(S$merge, sb)
    o(
      D.create(() => {
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
  s(o => o(delay(() => o(next(a)), o(run(o, as)))))

export const tryCatch = <A>(as: S<A>): S<A> =>
  s(o =>
    as.f(function S$tryCatch(e) {
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
    as.f(function S$map(e) {
      if (e instanceof Next) o(next(f(e.value)))
      else o(e)
    })
  )

export const tap = <A>(f: A => void, as: S<A>): S<A> =>
  s(o =>
    as.f(function S$tap(e) {
      if (e instanceof Next) f(e.value), o(e)
      else o(e)
    })
  )

export const filter = <A>(f: A => boolean, as: S<A>): S<A> =>
  s(o =>
    as.f(function S$filter(e) {
      if (e instanceof Next) f(e.value) && o(e)
      else o(e)
    })
  )

export const filterJust = <A, B>(f: A => ?B, as: S<A>): S<B> =>
  s(o =>
    as.f(function S$filter(e) {
      if (e instanceof Next) {
        const b = f(e.value)
        if (b) o(next(b))
      } else o(e)
    })
  )

export const take = <A>(n: number, as: S<A>): S<A> => {
  if (n <= 0) return empty()
  return s(o => {
    var i = 0
    const d = run(function S$take(e) {
      if (e instanceof Next) {
        o(e)
        if (++i === n) {
          d.dispose()
          o(end)
        }
      } else o(e)
    }, as)
    o(d)
  })
}

export const skip = <A>(n: number, as: S<A>): S<A> => {
  if (n <= 0) return as
  return s(o => {
    var i = 0
    const d = run(function S$skip(e) {
      if (e instanceof Next) {
        if (i++ < n) return
        o(e)
      } else o(e)
    }, as)
    o(d)
  })
}

export const scan = <A, B>(f: (B, A) => B, b: B, as: S<A>): S<B> => {
  return s(o => {
    o(
      delay(t => {
        var b_ = b
        o(next(b_))
        o(
          run(function S$scan(e) {
            if (e instanceof Next) o(next((b_ = f(b_, e.value))))
            else o(e)
          }, as)
        )
      })
    )
  })
}

export const multicast = <A>(as: S<A>): S<A> => {
  const os = []
  var d: ?D.Disposable
  return s(o => {
    if (d == null)
      d = run(e => {
        for (var o of os) o(e)
      }, as)
    os.push(o)
    o(
      D.create(() => {
        var index = os.indexOf(o)
        if (index < 0) return
        os.splice(index, 1)
        if (os.length === 0 && d) d = d.dispose()
      })
    )
  })
}

export const skipEquals = <A>(as: S<A>): S<A> => {
  var last: A
  return s(o => {
    as.f(e => {
      if (e instanceof Next) {
        if (last === e.value) return
        last = e.value
        o(e)
      } else o(e)
    })
  })
}

export const skipUntil = <A, U>(us: S<U>, as: S<A>): S<A> => {
  return s(o => {
    var skip = true
    var d
    o(
      (d = run(e => {
        if (e instanceof Next) {
          skip = false
          d.dispose()
        } else if (e instanceof Error) o(e)
      }, us))
    )
    o(
      run(e => {
        if (e instanceof Next) {
          if (!skip) o(e)
        } else o(e)
      }, as)
    )
  })
}

export function proxy<A>(): [(A) => void, S<A>] {
  const os = []
  var lastA: ?A
  const o = a => {
    lastA = a
    os.forEach(o => o(delay(() => o(next(a)))))
  }
  const proxy = s(o => {
    os.push(o)
    o(
      D.create(() => {
        const pos = os.indexOf(o)
        if (pos >= 0) os.splice(pos, 1)
      })
    )
    if (lastA) {
      const nextA = next(lastA)
      o(delay(() => o(nextA)))
    }
  })
  return [o, proxy]
}
