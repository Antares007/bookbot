// @flow strict
import type { NPith } from './N'
import * as S from '../S'
import { N, patch } from './N'

type SS<A> = S.S<A> | A

export const elm = <I, O>(
  tag: string,
  pith: SS<NPith<I, O>>,
  key?: ?string
): N<I, O> => {
  const TAG = tag.toUpperCase()
  return new N(
    () => {
      const elm = document.createElement(tag)
      if (key) elm.dataset.key = key
      return elm
    },
    n =>
      n instanceof HTMLElement &&
      n.nodeName === TAG &&
      (key == null || n.dataset.key === key)
        ? n
        : null,
    pith instanceof S.S ? pith : S.d(pith)
  )
}

export const text = <I, O>(texts: SS<string>): N<I, O> =>
  new N(
    () => document.createTextNode(''),
    n => (n instanceof Text ? n : null),
    S.d(o =>
      o(
        (texts instanceof S.S ? texts : S.d(texts)).map(text =>
          patch(n => {
            if (n.textContent !== text) n.textContent = text
          })
        )
      )
    )
  )
