// @flow strict
import { delay, now } from './scheduler'
import * as Disposable from './Disposable'

export { delay, now }

export class End {}
export const end = new End()

export class Event<+A> {
  +value: A
  constructor(value: A) {
    this.value = value
  }
}
export const event = <A>(a: A): Event<A> => new Event(a)

export class T<A> {
  pith: ((Event<A> | Error | End | Disposable.T) => void) => void
  constructor(pith: $PropertyType<T<A>, 'pith'>) {
    this.pith = pith
  }
  run(o: (Event<A> | End | Error) => void) {
    return run(o, this)
  }
  merge<B>(sb: T<B>): T<A | B> {
    return merge(this, sb)
  }
  startWith(a: A): T<A> {
    return startWith(a, this)
  }
  tryCatch(): T<A> {
    return tryCatch(this)
  }
  map<B>(f: A => B): T<B> {
    return map(f, this)
  }
  tap(f: A => void): T<A> {
    return tap(f, this)
  }
  flatMap<B>(f: A => T<B>): T<B> {
    return flatMap(f, this)
  }
  flatMapLatest<B>(f: A => T<B>): T<B> {
    return flatMapLatest(f, this)
  }
  filter(f: A => boolean): T<A> {
    return filter(f, this)
  }
  filter2<B>(f: A => ?B): T<B> {
    return filter2(f, this)
  }
  take(n: number): T<A> {
    return take(n, this)
  }
  skip(n: number): T<A> {
    return skip(n, this)
  }
  scan<B>(f: (B, A) => B, b: B): T<B> {
    return scan(f, b, this)
  }
  multicast(): T<A> {
    return multicast(this)
  }
  skipEquals(): T<A> {
    return skipEquals(this)
  }
}
export function s<A>(pith: $PropertyType<T<A>, 'pith'>): T<A> {
  return new T(pith)
}

export const empty = <A>(): T<A> => s(o => o(delay(() => o(end))))

export const at = <A>(a: A, dly: number = 0): T<A> =>
  s(o => {
    o(
      delay(() => {
        o(event(a))
        o(delay(() => o(end), 0))
      }, dly)
    )
  })

export const periodic = (period: number): T<number> =>
  s(o => {
    var i = 0
    o(
      delay(function periodic() {
        o(event(i++))
        o(delay(periodic, period))
      })
    )
  })

export const run = <A>(
  o: (Event<A> | Error | End) => void,
  as: T<A>
): Disposable.T => {
  var disposables = []
  var disposed = false
  const disposable = Disposable.create(() => {
    var d
    disposed = true
    while ((d = disposables.shift())) d.dispose()
  })
  var tp = now()
  as.pith(function S$run(e) {
    if (e instanceof Event) o(e)
    else if (e instanceof Disposable.T) {
      if (disposed) e.dispose()
      else if (tp === now()) disposables.push(e)
      else (tp = now()), (disposables = [e])
    } else {
      if (e instanceof Error) disposable.dispose()
      o(e)
    }
  })
  return disposable
}

export const flatMapLatest = <A, B>(f: A => T<B>, as: T<A>): T<B> =>
  s(o => {
    var esd: ?Disposable.T = null
    var ssd: ?Disposable.T = run(function S$flatMapLatestO(es) {
      if (es instanceof Event) {
        esd && esd.dispose()
        esd = run(function S$flatMapLatestI(e) {
          if (e instanceof Event) o(e)
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
      Disposable.create(() => {
        ssd && ssd.dispose()
        esd && esd.dispose()
      })
    )
  })

export const switchLatest = <A>(ss: T<T<A>>): T<A> =>
  s(o => {
    var esd: ?Disposable.T = null
    var ssd: ?Disposable.T = run(function S$switchLatestO(es) {
      if (es instanceof Event) {
        esd && esd.dispose()
        esd = run(function S$switchLatestI(e) {
          if (e instanceof Event) o(e)
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
      Disposable.create(() => {
        ssd && ssd.dispose()
        esd && esd.dispose()
      })
    )
  })

export const flatMap = <A, B>(f: A => T<B>, as: T<A>): T<B> =>
  s(o => {
    const dmap = new Map()
    o(
      Disposable.create(() => {
        for (var e of dmap.entries()) e[1].dispose()
      })
    )
    var i = 0
    const index = i++
    dmap.set(
      index,
      run(e => {
        if (e instanceof Event) {
          const index = i++
          dmap.set(
            index,
            run(e => {
              if (e instanceof Event) o(e)
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

export const combine = <A, B>(f: (Array<A>) => B, array: Array<T<A>>): T<B> =>
  s(o => {
    const dmap = new Map()
    const mas: Array<?Event<A>> = []
    for (var i = 0, l = array.length; i < l; i++) {
      mas.push(null)
      dmap.set(i, run(S$combine(i), array[i]))
    }
    o(
      Disposable.create(() => {
        for (var e of dmap.entries()) e[1].dispose()
      })
    )
    function S$combine(index) {
      return e => {
        if (e instanceof Event) {
          mas[index] = e
          var as = []
          for (var a of mas) {
            if (a == null) return
            as.push(a.value)
          }
          o(event(f(as)))
        } else if (e instanceof End) {
          dmap.delete(index)
          if (dmap.size === 0) o(end)
        } else o(e)
      }
    }
  })

export const merge = <A, B>(sa: T<A>, sb: T<B>): T<A | B> =>
  s(o => {
    var i = 2
    const sad = run(S$merge, sa)
    const sbd = run(S$merge, sb)
    o(
      Disposable.create(() => {
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

export const startWith = <A>(a: A, as: T<A>): T<A> =>
  s(o => o(delay(() => o(event(a)), o(run(o, as)))))

export const tryCatch = <A>(as: T<A>): T<A> =>
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

export const map = <A, B>(f: A => B, as: T<A>): T<B> =>
  s(o =>
    as.pith(function S$map(e) {
      if (e instanceof Event) o(event(f(e.value)))
      else o(e)
    })
  )

export const tap = <A>(f: A => void, as: T<A>): T<A> =>
  s(o =>
    as.pith(function S$tap(e) {
      if (e instanceof Event) f(e.value), o(e)
      else o(e)
    })
  )

export const filter = <A>(f: A => boolean, as: T<A>): T<A> =>
  s(o =>
    as.pith(function S$filter(e) {
      if (e instanceof Event) f(e.value) && o(e)
      else o(e)
    })
  )

export const filter2 = <A, B>(f: A => ?B, as: T<A>): T<B> =>
  s(o =>
    as.pith(function S$filter(e) {
      if (e instanceof Event) {
        const b = f(e.value)
        if (b) o(event(b))
      } else o(e)
    })
  )

export const take = <A>(n: number, as: T<A>): T<A> => {
  if (n <= 0) return empty()
  return s(o => {
    var i = 0
    const d = run(function S$take(e) {
      if (e instanceof Event) {
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

export const skip = <A>(n: number, as: T<A>): T<A> => {
  if (n <= 0) return as
  return s(o => {
    var i = 0
    const d = run(function S$skip(e) {
      if (e instanceof Event) {
        if (i++ < n) return
        o(e)
      } else o(e)
    }, as)
    o(d)
  })
}

export const scan = <A, B>(f: (B, A) => B, b: B, as: T<A>): T<B> => {
  return s(o => {
    o(
      delay(t => {
        var b_ = b
        o(event(b_))
        o(
          run(function S$scan(e) {
            if (e instanceof Event) o(event((b_ = f(b_, e.value))))
            else o(e)
          }, as)
        )
      })
    )
  })
}

export const multicast = <A>(as: T<A>): T<A> => {
  const os = []
  var d: ?Disposable.T
  return s(o => {
    if (d == null)
      d = run(e => {
        for (var o of os) o(e)
      }, as)
    os.push(o)
    o(
      Disposable.create(() => {
        var index = os.indexOf(o)
        if (index < 0) return
        os.splice(index, 1)
        if (os.length === 0 && d) d = d.dispose()
      })
    )
  })
}

export const skipEquals = <A>(as: T<A>): T<A> => {
  var last: A
  return s(o => {
    as.pith(e => {
      if (e instanceof Event) {
        if (last === e.value) return
        last = e.value
        o(e)
      } else o(e)
    })
  })
}
