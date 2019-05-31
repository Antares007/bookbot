// @flow strict
import * as S from './t'
import * as N from './t5'
import * as D from './S/Disposable'

export opaque type B<N: Element> = (N) => ?D.Disposable

export type Pith<N: Element> = S.Pith<
  (
    (
      S.Pith<
        | string
        | { R: 'Element', tag: string, b: B<HTMLElement>, key?: string }
        | { R: 'ElementNS', tag: string, ns: string, b: B<Element> }
        | { R: 'Comment', value: string }
      >
    ) => void
  ) => void
>

function elementBark<N: Element>(pith: Pith<N>): B<N> {
  return element => {
    return S.run(e => {}, S.map(pith => {}, pith))
  }
}
