// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as LR from './LR'
import * as M from './M'

export opaque type SPith<+L, +R> = ((LR.T<L, R>) => void) => D.Disposable

export const fromCB = <L, R>(cbf: ((?L, R) => void) => void): SPith<L, R> => o => {
  var disposed = false
  const d = Schdlr.delay(() =>
    cbf((l, r) => {
      if (disposed) return
      disposed = true
      if (l) o(LR.left(l))
      else o(LR.right(r))
    })
  )
  return D.create(() => {
    if (disposed) return
    disposed = true
    d.dispose()
  })
}

export function s<L, R>(pith: ((LR.T<L, R>) => void) => D.Disposable): SPith<L, R> {
  return o => {
    var last: LR.T<L, R>
    const d = pith(r => {
      if (last && last.T === 'left') return d.dispose()
      last = r
      o(r)
    })
    return d
  }
}

export function run<L, R>(o: (LR.T<L, R>) => void, s: SPith<L, R>): D.Disposable {
  var last: LR.T<L, R>
  const d = s(r => {
    if (last && last.T === 'left') return d.dispose()
    last = r
    o(r)
  })
  return d
}

export const d = <A>(a: A, delay: number = 0): SPith<void, A> => o => {
  var d = Schdlr.delay(() => {
    d = Schdlr.delay(() => o(LR.left()))
    o(LR.right(a))
  }, delay)
  return D.create(() => d.dispose())
}

export const empty: SPith<void, empty> = o => Schdlr.delay(() => o(LR.left()))

export const never: SPith<void, empty> = o => D.empty

export const multicast = <L, A>(source: SPith<L, A>): SPith<L, A> => {
  var md: D.Disposable
  var os: Array<(LR.T<L, A>) => void> = []
  function b(r: LR.T<L, A>): void {
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

export const periodic = (period: number): SPith<void, void> => o => {
  var d = Schdlr.delay(function periodicNext() {
    d = Schdlr.delay(periodicNext, period)
    o(LR.right())
  })
  return D.create(() => d.dispose())
}

export const map = <L, A, B>(f: A => B): ((SPith<L, A>) => SPith<L, B>) => s => o =>
  s(r => o(LR.map(f, r)))

export const tap = <L, A, B>(f: A => B): ((SPith<L, A>) => SPith<L, A>) => s => o =>
  s(r => o(LR.map(lr => (f(lr), lr), r)))

export const filter = <L, A>(f: A => boolean): ((SPith<L, A>) => SPith<L | void, A>) => s => o =>
  s(r => o(LR.filter(f, r)))

export const take = <L, A>(n: number): ((SPith<L, A>) => SPith<L | void, A>) => as =>
  n <= 0
    ? empty
    : s(o => {
        var i = 0
        const d = run(r => {
          if (r.T === 'right') {
            o(r)
            if (++i === n) {
              d.dispose()
              o(LR.left())
            }
          } else o(r)
        }, as)
        return d
      })

export const scan = <L, A, B>(f: (B, A) => B, b: B): ((SPith<L, A>) => SPith<L, B>) => as =>
  s(o => {
    var acc = b
    return as(r => (r.T === 'right' ? o(LR.right((acc = f(acc, r.value)))) : o(r)))
  })

export const merge = <L, A>(...ss: Array<SPith<L, A>>): SPith<L, A> => o => {
  const dmap = new Map()
  for (let s of ss)
    dmap.set(
      s,
      s(r => {
        if (r.T === 'right') o(r)
        else {
          dmap.delete(s)
          if (dmap.size === 0) o(r)
        }
      })
    )
  return D.create(() => dmap.forEach(d => d.dispose()))
}

export const flatMap = <L, A, B>(
  f: A => SPith<L, B>
): ((SPith<L, A>) => SPith<L, B>) => so => o => {
  const dmap = new Map()
  dmap.set(
    so,
    so(r => {
      if (r.T === 'right') {
        const si = f(r.value)
        dmap.set(
          si,
          si(r => {
            if (r.T === 'right') {
              o(r)
            } else {
              dmap.delete(si)
              if (dmap.size === 0) o(r)
            }
          })
        )
      } else {
        dmap.delete(so)
        if (dmap.size === 0) o(r)
      }
    })
  )
  return D.create(() => dmap.forEach(d => d.dispose()))
}

//export function flatMap<A, B>(f: A => SPith<B>, so: SPith<A>): SPith<B> {
//  return function flatMapPith(o) {
//    const dmap = new Map()
//    const d = D.create(() => dmap.forEach(d => d.dispose()))
//    dmap.set(
//      so,
//      so(function flatMapOO(r) {
//        if (r.T === 'next') {
//          var si
//          try {
//            si = f(r.value)
//          } catch (err) {
//            d.dispose()
//            return o({ T: 'error', error: err })
//          }
//          dmap.set(
//            si,
//            si(function flatMapIO(r) {
//              if (r.T === 'next') o(r)
//              else {
//                dmap.delete(si)
//                if (r.T === 'end') dmap.size === 0 && o(r)
//                else d.dispose(), o(r)
//              }
//            })
//          )
//        } else {
//          dmap.delete(so)
//          if (r.T === 'end') dmap.size === 0 && o(r)
//          else d.dispose(), o(r)
//        }
//      })
//    )
//    return d
//  }
//}

//export function combine<A, B>(f: (...Array<A>) => B, ...ss: Array<SPith<A>>): SPith<B> {
//  return function combinePith(o) {
//    const dmap = new Map()
//    const d = D.create(() => dmap.forEach(d => d.dispose()))
//    const indices: Array<number> = []
//    const values = new Array(ss.length)
//    var hasallvalues = false
//    ss.forEach((s, index) =>
//      dmap.set(
//        s,
//        s(function combineO(r) {
//          if (r.T === 'next') {
//            values[index] = r.value
//            goto: while (true) {
//              if (hasallvalues) {
//                var b
//                try {
//                  b = f(...values)
//                } catch (error) {
//                  d.dispose()
//                  return o({ T: 'error', error })
//                }
//                o({ T: 'next', value: b })
//                break
//              } else {
//                const pos = Schdlr.binarySearchRightmost(index, indices)
//                if (pos === -1 || indices[pos] < index) {
//                  indices.splice(pos + 1, 0, index)
//                  if ((hasallvalues = indices.length === values.length)) continue goto
//                  else break
//                }
//              }
//            }
//          } else {
//            dmap.delete(s)
//            if (r.T === 'end') dmap.size === 0 && o(r)
//            else d.dispose(), o(r)
//          }
//        })
//      )
//    )
//    return d
//  }
//}
//
//export function switchLatest<A>(so: SPith<SPith<A>>): SPith<A> {
//  return function switchLatestPith(o) {
//    const d = D.create(() => {
//      sod && sod.dispose()
//      sid && sid.dispose()
//    })
//    var sid: ?D.Disposable = null
//    var sod: ?D.Disposable = so(function switchLatestOO(r) {
//      if (r.T === 'next') {
//        sid && sid.dispose()
//        sid = r.value(function switchLatestIO(r) {
//          if (r.T === 'next') o(r)
//          else {
//            sid = null
//            if (r.T === 'end') sod || o(r)
//            else d.dispose(), o(r)
//          }
//        })
//      } else {
//        sod = null
//        if (r.T === 'end') sid || o(r)
//        else d.dispose(), o(r)
//      }
//    })
//    return d
//  }
//}
//
//
//export function flatMapEnd<A>(f: () => SPith<A>, s: SPith<A>): SPith<A> {
//  return function flatMapEndPith(o) {
//    var d = s(function flatMapEndO(r) {
//      if (r.T === 'end') {
//        var s
//        try {
//          s = f()
//        } catch (error) {
//          d.dispose()
//          return o({ T: 'error', error })
//        }
//        d = s(o)
//      } else o(r)
//    })
//    return D.create(() => d.dispose())
//  }
//}
//
//export function flatMapError<A>(f: Error => SPith<A>, s: SPith<A>): SPith<A> {
//  return function flatMapErrorPith(o) {
//    var d = s(function flatMapErrorO(r) {
//      if (r.T === 'error') {
//        var s
//        try {
//          s = f(r.error)
//        } catch (error) {
//          d.dispose()
//          return o({ T: 'error', error })
//        }
//        d = s(o)
//      } else o(r)
//    })
//    return D.create(() => d.dispose())
//  }
//}
//

//
//export function subject<A>(): [(RValue<A> | REnd | RError) => void, SPith<A>] {
//  var O
//  return [
//    r => {
//      if (O) O(r)
//    },
//    multicast(
//      s(o => {
//        O = o
//        return D.create(() => {
//          O = null
//        })
//      })
//    )
//  ]
//}
//
//export function proxy<A>(): [(RValue<A> | REnd | RError) => void, SPith<A>] {
//  var proxyOs: ?Array<(RValue<A> | REnd | RError) => void> = []
//  var last: REnd | RError
//  return [
//    function proxyO(r) {
//      if (proxyOs) {
//        if (r.T === 'next') proxyOs.forEach(o => o(r))
//        else {
//          const os = proxyOs
//          last = r
//          proxyOs = null
//          os.forEach(o => o(last))
//        }
//      }
//    },
//    function pith(o) {
//      if (proxyOs) {
//        const os = proxyOs
//        proxyOs.push(o)
//        return D.create(() => {
//          const pos = os.indexOf(o)
//          if (-1 < pos) os.splice(pos, 1)
//        })
//      } else {
//        return Schdlr.delay(() => o(last))
//      }
//    }
//  ]
//}
//
//export class On {
//  ets: SPith<Node>
//  constructor(ets: SPith<Node>) {
//    this.ets = ets
//  }
//  event(name: string) {
//    return switchLatest(
//      map(
//        et =>
//          s(o => {
//            const handler = (e: Event) => o({ T: 'next', value: e })
//            et.addEventListener(name, handler)
//            return D.create(() => et.removeEventListener(name, handler))
//          }),
//        this.ets
//      )
//    )
//  }
//  click() {
//    return this.event('click')
//  }
//  input() {
//    return this.event('input')
//  }
//}
