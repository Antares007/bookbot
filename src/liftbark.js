// @flow strict
import * as S from './tS'

export function liftBark<R: {}, B, C, D>(
  bark: (((R) => void, C, D) => void) => B
): (((S.SPith<R> | R) => void, S.SPith<C>, S.SPith<D>) => void) => S.SPith<B> {
  return function sbark(pith) {
    const rays: Array<S.SPith<R>> = []
    const pC = S.proxy()
    const pD = S.proxy()
    pith(
      r => {
        rays.push(typeof r === 'object' ? S.d(r) : r)
      },
      pC[1],
      pD[1]
    )
    if (rays.length === 0) return S.d(bark(o => {}))
    return S.combine(
      (...rays) =>
        bark((o, c, d) => {
          pC[0]({ T: 'next', value: c })
          pD[0]({ T: 'next', value: d })
          console.log(rays)
          for (var r of rays) o(r)
        }),
      ...rays
    )
  }
}
