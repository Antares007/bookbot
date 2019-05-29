// @flow strict
import * as S from './t'
import { binarySearchRightmost } from './S/scheduler'
import * as D from './S/Disposable'
import type { Pith } from './pith'

export type SS<+A> = S.S<A> | A

export type NPith = Pith<
  | (S.S<S.S<(Node) => void> & { tag: string, key: ?string }> & { R: 'element' })
  | string
  | (S.S<string> & { R: '#text' })
  | (S.S<string> & { R: '#comment' }),
  Node,
  void
>

function bark(pith: NPith): S.S<(Node) => void> {
  return S.s(o => {
    return S.d(node => {
      pith(r => {
        if (typeof r === 'string') {
          r
        } else if (r.R === 'element') {
          r
        } else {
          r
        }
      }, node)
    }).pith(o)
  })
}
