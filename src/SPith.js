// @flow strict
import * as S from './S'

type SS<A> = S.S<A> | A

export const pmap = <Oi, Ai, Bi, Oo, Ao, Bo>(
  f: (((Oi) => void, Ai) => Bi) => ((Oo) => void, Ao) => Bo,
  pith: SS<((Oi) => void, Ai) => Bi>
): SS<((Oo) => void, Ao) => Bo> => (pith instanceof S.S ? pith.map(f) : f(pith))

export class T<A, B, O> {
  pith: SS<((O) => void, A) => B>

  constructor(pith: $PropertyType<T<A, B, O>, 'pith'>) {
    this.pith = pith
  }
}
