// @flow strict
import * as S from './S'
import * as D_ from './S/Disposable'
import * as M from './M'

const noop = () => {}
export function liftBark<R: {}, B, C, D>(
  bark: (((R) => void, C, D) => void) => B
): (((S.SPith<R> | R) => void, S.SPith<C>, S.SPith<D>) => void) => S.SPith<B> {
  return function sbark(pith) {
    const rays: Array<S.SPith<R>> = []
    const cSubject = S.subject()
    const dSubject = S.subject()

    pith(
      r => {
        rays.push(typeof r === 'object' ? S.d(r) : r)
      },
      cSubject[1],
      dSubject[1]
    )
    if (rays.length === 0) return S.d(bark(o => {}))
    return S.combine(
      (...rays) =>
        bark((o, c, d) => {
          cSubject[0]({ T: 'next', value: c })
          dSubject[0]({ T: 'next', value: d })
          for (var r of rays) o(r)
        }),
      ...rays
    )
  }
}
