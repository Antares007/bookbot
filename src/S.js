// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as LR from './LR'
import * as M from './M'

export opaque type SPith<+A> = ((LR.T<?Error, A>) => void) => D.Disposable

export const d = <A>(a: A, delay: number = 0): SPith<A> => o => {
  var d = Schdlr.delay(() => {
    d = Schdlr.delay(() => o(LR.left()))
    o(LR.right(a))
  }, delay)
  return D.create(() => d.dispose())
}

export function s<A>(pith: ((LR.T<?Error, A>) => void) => D.Disposable): SPith<A> {
  return o => {
    var last: LR.T<?Error, A>
    const d = pith(r => {
      if (last && last.T === 'left') return d.dispose()
      last = r
      o(r)
    })
    return d
  }
}

export const empty: SPith<empty> = o => Schdlr.delay(() => o(LR.left()))

export const never: SPith<empty> = o => D.empty

export const run = <A>(o: (LR.T<?Error, A>) => void): ((SPith<A>) => D.Disposable) => s => {
  const d = s(r => {
    if (r.T === 'left' && r.value) d.dispose()
    o(r)
  })
  return d
}

export const map = <A, B>(f: A => B): ((SPith<A>) => SPith<B>) => s => o => s(r => o(LR.map(f, r)))

export const tap = <A, ANY>(f: A => ANY): ((SPith<A>) => SPith<A>) => s => o =>
  s(r => o(LR.map(lr => (f(lr), lr), r)))

export const filter = <A>(f: A => boolean): ((SPith<A>) => SPith<A>) => s => o =>
  s(r => o(LR.filter(f, r)))

export const scan = <A, B>(f: (B, A) => B, b: B): ((SPith<A>) => SPith<B>) => as => o => {
  var acc = b
  return map(a => (acc = f(acc, a)))(as)(o)
}

export const join = <A>(so: SPith<SPith<A>>): SPith<A> => o => {
  const dmap = new Map()
  dmap.set(
    so,
    so(r => {
      if (r.T === 'right') {
        dmap.set(
          r.value,
          r.value(r => {
            if (r.T === 'right') {
              o(r)
            } else {
              dmap.delete(r.value)
              if (r.value || dmap.size === 0) o(r)
            }
          })
        )
      } else {
        dmap.delete(so)
        if (r.value || dmap.size === 0) o(r)
      }
    })
  )
  return D.create(() => dmap.forEach(d => d.dispose()))
}

export const flatMap = <A, B>(f: A => SPith<B>): ((SPith<A>) => SPith<B>) => so => join(map(f)(so))

export const merge = <A>(...ss: Array<SPith<A>>): SPith<A> => o => {
  const dmap = new Map()
  for (let s of ss)
    dmap.set(
      s,
      s(r => {
        if (r.T === 'right') o(r)
        else {
          dmap.delete(s)
          if (r.value || dmap.size === 0) o(r)
        }
      })
    )
  return D.create(() => dmap.forEach(d => d.dispose()))
}

export const fromCB = <A>(cbf: ((?Error, A) => void) => void): SPith<A> => o => {
  var disposed = false
  var sameCallStack = true
  var firstRun = true
  var d

  cbf((l, r) => {
    if (!firstRun) return
    firstRun = false
    const e = l ? LR.left(l) : LR.right(r)
    const send = () => {
      d = Schdlr.delay(() => o(LR.left()))
      o(e)
    }
    if (sameCallStack) d = Schdlr.delay(send)
    else if (!disposed) send()
  })

  sameCallStack = false

  return D.create(() => {
    disposed = true
    if (d) d.dispose()
  })
}

export const multicast = <A>(source: SPith<A>): SPith<A> => {
  var md: D.Disposable
  var os: Array<(LR.T<?Error, A>) => void> = []
  function b(r: LR.T<?Error, A>): void {
    if (r.T === 'right') os.forEach(o => o(r))
    else {
      const os_ = os
      os = []
      msource = M.ab(source)
      os_.forEach(o => o(r))
    }
  }
  var msource = M.ab(source)
  return o => {
    os.push(o)
    md = msource(b)
    return D.create(() => {
      const pos = os.indexOf(o)
      if (pos > -1) {
        os.splice(pos, 1)
        if (os.length === 0) {
          md.dispose()
          msource = M.ab(source)
        }
      }
    })
  }
}

export const periodic = (period: number): SPith<void> => o => {
  var d = Schdlr.delay(function periodicNext() {
    d = Schdlr.delay(periodicNext, period)
    o(LR.right())
  })
  return D.create(() => d.dispose())
}

export const take = <A>(n: number): ((SPith<A>) => SPith<A>) => as =>
  n > 0
    ? o => {
        var i = 0
        const d = as(r => {
          if (r.T === 'right') {
            o(r)
            if (++i >= n) {
              d.dispose()
              o(LR.left())
            }
          } else o(r)
        })
        return d
      }
    : empty

export const combine = <A>(ss: Array<SPith<A>>): SPith<Array<A>> => o => {
  const dmap = new Map()
  const indices: Array<number> = []
  const length = ss.length
  const values = new Array(length)
  var hasallvalues = false
  ss.forEach((s, index) =>
    dmap.set(
      s,
      s(r => {
        if (r.T === 'right') {
          values[index] = r.value
          if (hasallvalues) o(LR.right(values))
          else {
            const pos = Schdlr.binarySearchRightmost(index, indices)
            if (pos === -1 || indices[pos] < index) {
              indices.splice(pos + 1, 0, index)
              if ((hasallvalues = indices.length === length)) o(LR.right(values))
            }
          }
        } else {
          dmap.delete(s)
          if (r.value || dmap.size === 0) o(r)
        }
      })
    )
  )
  return D.create(() => dmap.forEach(d => d.dispose()))
}

export function switchLatest<A>(so: SPith<SPith<A>>): SPith<A> {
  return function switchLatestPith(o) {
    const d = D.create(() => {
      sod && sod.dispose()
      sid && sid.dispose()
    })
    var sid: ?D.Disposable = null
    var sod: ?D.Disposable = so(function switchLatestOO(r) {
      if (r.T === 'right') {
        sid && sid.dispose()
        sid = r.value(function switchLatestIO(r) {
          if (r.T === 'right') o(r)
          else {
            sid = null
            if (r.value || !sod) o(r)
          }
        })
      } else {
        sod = null
        if (r.value || !sid) o(r)
      }
    })
    return d
  }
}

export function subject<A>(): [(LR.T<?Error, A>) => void, SPith<A>] {
  var O
  return [
    r => {
      if (O) O(r)
    },
    multicast(
      s(o => {
        O = o
        return D.create(() => {
          O = null
        })
      })
    )
  ]
}

export function proxy<A>(): [(LR.T<?Error, A>) => void, SPith<A>] {
  var proxyOs: ?Array<(LR.T<?Error, A>) => void> = []
  var last: LR.Left<?Error>
  return [
    function proxyO(r) {
      if (proxyOs) {
        if (r.T === 'right') proxyOs.forEach(o => o(r))
        else {
          const os = proxyOs
          last = r
          proxyOs = null
          os.forEach(o => o(last))
        }
      }
    },
    function pith(o) {
      if (proxyOs) {
        const os = proxyOs
        proxyOs.push(o)
        return D.create(() => {
          const pos = os.indexOf(o)
          if (-1 < pos) os.splice(pos, 1)
        })
      } else {
        return Schdlr.delay(() => o(last))
      }
    }
  ]
}

export class On {
  ets: SPith<Node>
  constructor(ets: SPith<Node>) {
    this.ets = ets
  }
  event(name: string) {
    return switchLatest(
      map(et =>
        s(o => {
          const handler = (e: Event) => o(LR.right(e))
          et.addEventListener(name, handler)
          return D.create(() => et.removeEventListener(name, handler))
        })
      )(this.ets)
    )
  }
  click() {
    return this.event('click')
  }
  input() {
    return this.event('input')
  }
}
