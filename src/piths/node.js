// @flow strict
import * as S from '../S'

type SS<A> = S.S<A> | A

declare export class NodePith {
  pith: (
    (SS<NodePith | TextPith>) => void,
    (SS<(Node) => void>) => void
  ) => void;
}
declare export function node(pith: $PropertyType<NodePith, 'pith'>): NodePith

declare export class TextPith {
  pith: ((SS<string>) => void) => void;
}
declare export function text(pith: $PropertyType<TextPith, 'pith'>): TextPith

node((o, op) => {
  op(S.d(n => {}))
  o(
    node(o => {
      o(
        text(o => {
          o(S.d('a'))
          o('b')
        })
      )
    })
  )
  o(
    text(o => {
      o(S.d('a'))
      o('b')
    })
  )
})
