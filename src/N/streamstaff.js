// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'

export type SS<A> = S.S<A> | A

export function ssmap<A, B>(f: A => B, ss: SS<A>): SS<B> {
  return ss instanceof S.S ? ss.map(f) : f(ss)
}
