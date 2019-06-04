// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as S from './tS'

export opaque type PPith<+A> = (
  ({ R: 'next', +value: A } | { R: 'error', error: Error }) => void
) => D.Disposable

export function p<+A>(
  pith: (({ R: 'next', +value: A } | { R: 'error', error: Error }) => void) => void
) {}

function spmap<A, B>(f: A => B, sp: S.SPith<Promise<A>>): S.SPith<Promise<B>> {
  return S.map(p => p.then(f), sp)
}

function spcombine<A, B>(
  f: (...Array<A>) => B,
  ...sps: Array<S.SPith<Promise<A>>>
): S.SPith<Promise<B>> {
  return S.combine((...ps) => Promise.all(ps).then(x => f(...x)), ...sps)
}
