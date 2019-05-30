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
    const dmap = new Map()
    const d = D.create(() => dmap.forEach(d => d.dispose()))
    const start = s =>
      dmap.set(
        s,
        S.run(r => {
          if (r.T === 'next') o(r)
          else {
            dmap.delete(s)
            if (r.T === 'end') dmap.size === 0 && o(r)
            else d.dispose(), o(r)
          }
        }, s)
      )
    const stop = s => {
      const d = dmap.get(s)
      if (d) {
        dmap.delete(s)
        d.dispose()
      }
    }
    start(
      S.d(node => {
        const indices: Array<number> = []

        pith(r => {
          const index = 0
          var pos = binarySearchRightmost(index, indices)
          if (typeof r === 'string') {
            r
          } else if (r.R === 'element') {
            r
          } else {
            r
          }
        }, node)
      })
    )
    return d
  })
}

function find<N, T>(f: N => ?T, fromIndex: number, array: NodeList<N>): ?T {
  for (var i = fromIndex, l = array.length; i < l; i++) {
    const mt = f(array[i])
    if (mt) return mt
  }
}
