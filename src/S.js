// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as LR from './LR'
import * as M from './M'

export opaque type SPith<+L, +R> = ((LR.T<?L, R>) => void) => D.Disposable

export const map = <L, A, B>(f: A => B): ((SPith<L, A>) => SPith<L | Error, B>) => s => o =>
  s(r => o(LR.map(f, r)))

export const tap = <L, A, B>(f: A => B): ((SPith<L, A>) => SPith<L | Error, A>) => s => o =>
  s(r => o(LR.map(lr => (f(lr), lr), r)))

export const filter = <L, A>(f: A => boolean): ((SPith<L, A>) => SPith<L | Error, A>) => s => o =>
  s(r => o(LR.filter(f, r)))

export const scan = <L, A, B>(
  f: (B, A) => B,
  b: B
): ((SPith<L, A>) => SPith<L | Error, B>) => as => o => {
  var acc = b
  return as(r => o(LR.map(a => (acc = f(acc, a)), r)))
}

export const join = <La, Lb, R>(so: SPith<La, SPith<Lb, R>>): SPith<La | Lb, R> => o => {
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

export const flatMap = <La, Lb, Ra, Rb>(
  f: Ra => SPith<Lb, Rb>
): ((SPith<La, Ra>) => SPith<La | Lb | Error, Rb>) => so => join(map(f)(so))

export const fromCB = <L, R>(cbf: ((?L, R) => void) => void): SPith<L, R> => o => {
  var disposed = false
  var sameCallStack = true
  var firstRun = true
  var d

  cbf((l, r) => {
    if (!firstRun) return
    firstRun = false
    const e = l ? LR.left(l) : LR.right(r)
    if (sameCallStack) d = Schdlr.delay(() => o(e))
    else if (!disposed) o(e)
  })

  sameCallStack = false

  return D.create(() => {
    disposed = true
    if (d) d.dispose()
  })
}

//
//export function s<L, R>(pith: ((LR.T<L, R>) => void) => D.Disposable): SPith<L, R> {
//  return o => {
//    var last: LR.T<L, R>
//    const d = pith(r => {
//      if (last && last.T === 'left') return d.dispose()
//      last = r
//      o(r)
//    })
//    return d
//  }
//}
//
//export function run<L, R>(o: (LR.T<L, R>) => void, s: SPith<L, R>): D.Disposable {
//  var last: LR.T<L, R>
//  const d = s(r => {
//    if (last && last.T === 'left') return d.dispose()
//    last = r
//    o(r)
//  })
//  return d
//}
//
//export const d = <A>(a: A, delay: number = 0): SPith<void, A> => o => {
//  var d = Schdlr.delay(() => {
//    d = Schdlr.delay(() => o(LR.left()))
//    o(LR.right(a))
//  }, delay)
//  return D.create(() => d.dispose())
//}
//
//export const empty: SPith<void, empty> = o => Schdlr.delay(() => o(LR.left()))
//
//export const never: SPith<void, empty> = o => D.empty
//
//export const left = <L>(l: L): SPith<L, empty> => o => Schdlr.delay(() => o(LR.left(l)))
//
//export const right = <R>(r: R): SPith<empty, R> => o => Schdlr.delay(() => o(LR.right(r)))
//
//export const multicast = <L, A>(source: SPith<L, A>): SPith<L, A> => {
//  var md: D.Disposable
//  var os: Array<(LR.T<L, A>) => void> = []
//  function b(r: LR.T<L, A>): void {
//    if (r.T === 'right') os.forEach(o => o(r))
//    else {
//      const os_ = os
//      os = []
//      msource = M.ab(source)
//      os_.forEach(o => o(r))
//    }
//  }
//  var msource = M.ab(source)
//  return o => {
//    os.push(o)
//    md = msource(b)
//    return D.create(() => {
//      const pos = os.indexOf(o)
//      if (pos > -1) {
//        os.splice(pos, 1)
//        if (os.length === 0) {
//          md.dispose()
//          msource = M.ab(source)
//        }
//      }
//    })
//  }
//}
//
//export const periodic = (period: number): SPith<void, void> => o => {
//  var d = Schdlr.delay(function periodicNext() {
//    d = Schdlr.delay(periodicNext, period)
//    o(LR.right())
//  })
//  return D.create(() => d.dispose())
//}
//
//export const tryCatch = <L, A>(s: SPith<L, A>): SPith<L | Error, A> => o => {
//  const d = s(r => {
//    try {
//      o(r)
//    } catch (err) {
//      d.dispose()
//      o(LR.left(err instanceof Error ? err : new Error(err)))
//    }
//  })
//  return d
//}
//
//
//export const take = <L, A>(n: number): ((SPith<L, A>) => SPith<L | void, A>) => as =>
//  n <= 0
//    ? empty
//    : s(o => {
//        var i = 0
//        const d = run(r => {
//          if (r.T === 'right') {
//            o(r)
//            if (++i === n) {
//              d.dispose()
//              o(LR.left())
//            }
//          } else o(r)
//        }, as)
//        return d
//      })
//
//
//export const merge = <L, A>(...ss: Array<SPith<L, A>>): SPith<L, A> => o => {
//  const dmap = new Map()
//  for (let s of ss)
//    dmap.set(
//      s,
//      s(r => {
//        if (r.T === 'right') o(r)
//        else {
//          dmap.delete(s)
//          if (dmap.size === 0) o(r)
//        }
//      })
//    )
//  return D.create(() => dmap.forEach(d => d.dispose()))
//}
//
//
//export const combine = <L, A>(...ss: Array<SPith<L, A>>): SPith<L, Array<A>> => o => {
//  const dmap = new Map()
//  const indices: Array<number> = []
//  const length = ss.length
//  const values = new Array(length)
//  var hasallvalues = false
//  ss.forEach((s, index) =>
//    dmap.set(
//      s,
//      s(r => {
//        if (r.T === 'right') {
//          values[index] = r.value
//          goto: while (true) {
//            if (hasallvalues) {
//              o(LR.right(values))
//              break
//            } else {
//              const pos = Schdlr.binarySearchRightmost(index, indices)
//              if (pos === -1 || indices[pos] < index) {
//                indices.splice(pos + 1, 0, index)
//                if ((hasallvalues = indices.length === length)) continue goto
//                else break
//              }
//            }
//          }
//        } else {
//          dmap.delete(s)
//          if (dmap.size === 0) o(r)
//        }
//      })
//    )
//  )
//  return D.create(() => dmap.forEach(d => d.dispose()))
//}
//
////export function combine<A, B>(f: (...Array<A>) => B, ...ss: Array<SPith<A>>): SPith<B> {
////  return function combinePith(o) {
////  }
////}
////
////export function switchLatest<A>(so: SPith<SPith<A>>): SPith<A> {
////  return function switchLatestPith(o) {
////    const d = D.create(() => {
////      sod && sod.dispose()
////      sid && sid.dispose()
////    })
////    var sid: ?D.Disposable = null
////    var sod: ?D.Disposable = so(function switchLatestOO(r) {
////      if (r.T === 'next') {
////        sid && sid.dispose()
////        sid = r.value(function switchLatestIO(r) {
////          if (r.T === 'next') o(r)
////          else {
////            sid = null
////            if (r.T === 'end') sod || o(r)
////            else d.dispose(), o(r)
////          }
////        })
////      } else {
////        sod = null
////        if (r.T === 'end') sid || o(r)
////        else d.dispose(), o(r)
////      }
////    })
////    return d
////  }
////}
////
////
////export function flatMapEnd<A>(f: () => SPith<A>, s: SPith<A>): SPith<A> {
////  return function flatMapEndPith(o) {
////    var d = s(function flatMapEndO(r) {
////      if (r.T === 'end') {
////        var s
////        try {
////          s = f()
////        } catch (error) {
////          d.dispose()
////          return o({ T: 'error', error })
////        }
////        d = s(o)
////      } else o(r)
////    })
////    return D.create(() => d.dispose())
////  }
////}
////
////export function flatMapError<A>(f: Error => SPith<A>, s: SPith<A>): SPith<A> {
////  return function flatMapErrorPith(o) {
////    var d = s(function flatMapErrorO(r) {
////      if (r.T === 'error') {
////        var s
////        try {
////          s = f(r.error)
////        } catch (error) {
////          d.dispose()
////          return o({ T: 'error', error })
////        }
////        d = s(o)
////      } else o(r)
////    })
////    return D.create(() => d.dispose())
////  }
////}
////
//
////
////export function subject<A>(): [(RValue<A> | REnd | RError) => void, SPith<A>] {
////  var O
////  return [
////    r => {
////      if (O) O(r)
////    },
////    multicast(
////      s(o => {
////        O = o
////        return D.create(() => {
////          O = null
////        })
////      })
////    )
////  ]
////}
////
////export function proxy<A>(): [(RValue<A> | REnd | RError) => void, SPith<A>] {
////  var proxyOs: ?Array<(RValue<A> | REnd | RError) => void> = []
////  var last: REnd | RError
////  return [
////    function proxyO(r) {
////      if (proxyOs) {
////        if (r.T === 'next') proxyOs.forEach(o => o(r))
////        else {
////          const os = proxyOs
////          last = r
////          proxyOs = null
////          os.forEach(o => o(last))
////        }
////      }
////    },
////    function pith(o) {
////      if (proxyOs) {
////        const os = proxyOs
////        proxyOs.push(o)
////        return D.create(() => {
////          const pos = os.indexOf(o)
////          if (-1 < pos) os.splice(pos, 1)
////        })
////      } else {
////        return Schdlr.delay(() => o(last))
////      }
////    }
////  ]
////}
////
////export class On {
////  ets: SPith<Node>
////  constructor(ets: SPith<Node>) {
////    this.ets = ets
////  }
////  event(name: string) {
////    return switchLatest(
////      map(
////        et =>
////          s(o => {
////            const handler = (e: Event) => o({ T: 'next', value: e })
////            et.addEventListener(name, handler)
////            return D.create(() => et.removeEventListener(name, handler))
////          }),
////        this.ets
////      )
////    )
////  }
////  click() {
////    return this.event('click')
////  }
////  input() {
////    return this.event('input')
////  }
////}
