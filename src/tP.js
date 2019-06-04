// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as S from './tS'

export type RValue<+A> = { R: 'value', +value: A }
export type RError = { R: 'error', error: Error }

export opaque type PPith<+A> = ((RValue<A> | RError) => void) => void

export function p<A>(pith: ((RValue<A> | RError) => void) => void): PPith<A> {
  var last: ?(RValue<A> | RError) = null
  var os: ?Array<(RValue<A> | RError) => void> = null
  return function(o) {
    if (last) {
      const r = last
      Schdlr.delay(() => o(r))
    } else if (last == null && os != null) {
      os.push(o)
    } else {
      os = []
      try {
        pith(r => {
          if (last != null || os == null) return
          last = r
          const os_ = os
          os = null
          os_.forEach(o => Schdlr.delay(() => o(r)))
        })
      } catch (error) {
        Schdlr.delay(() => o(error))
      }
    }
  }
}

function spmap<A, B>(f: A => B, sp: S.SPith<Promise<A>>): S.SPith<Promise<B>> {
  return S.map(p => p.then(f), sp)
}

function spcombine<A, B>(
  f: (...Array<A>) => B,
  ...sps: Array<S.SPith<Promise<A>>>
): S.SPith<Promise<B>> {
  return S.combine((...ps) => Promise.all(ps).then(x => f(...x)), ...sps)
}
