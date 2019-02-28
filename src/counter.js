// @flow strict-local
import type { On } from './on'
import { mkOn } from './on'
import type { PNode$Node, PNode$Pith } from './pnode'
import { run, node, pith } from './pnode'
import { defaultScheduler } from './scheduler'
import { S } from './stream'

type Pith<A> = ((S<O<A>> | O<A>) => void, On) => void

type O<A> =
  | { type: 'attribute', v: { [string]: string } }
  | { type: 'style', v: { [$Keys<CSSStyleDeclaration>]: string } }
  | { type: 'dispatch', v: S<A> }
  | { type: 'element', pith: Pith<A> }
  | { type: 'text', text: string }

export const attribute = <A>(v: { [string]: string }): O<A> => ({
  type: 'attribute',
  v
})
export const style = <A>(v: {
  [$Keys<CSSStyleDeclaration>]: string
}): O<A> => ({
  type: 'style',
  v
})
export const dispatch = <A>(v: S<A>): O<A> => ({ type: 'dispatch', v })

export const elm = (
  tag: string,
  p: ((S<PNode$Node<Node>> | PNode$Node<Node>) => void) => void
): PNode$Node<Node> =>
  node(
    () => document.createElement(tag),
    elm => elm.nodeName === tag.toUpperCase(),
    run(pith(p))
  )
export const text = (text: S<string> | string): PNode$Node<Node> =>
  node(
    () => document.createTextNode(''),
    elm => elm.nodeName === '#text',
    (text instanceof S ? text : S.at(text)).map(text => parent => {
      if (parent.textContent !== text) parent.textContent = text
    })
  )

const counter = d =>
  elm('div', (o, n) => {
    o(
      elm('button', o => {
        o(text('+'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      elm('button', o => {
        o(text('-'))
        d > 0 && o(counter(d - 1))
      })
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

run(
  pith(o => {
    o(text('zmuki0'))
    o(
      S.periodic(1000)
        .skip(1)
        .scan(a => a + 1, 0)
        .skip(1)
        .map(n => {
          if (n % 2 === 0) {
            return text('hey' + n)
          }
          return counter(n % 5)
        })
    )
    o(text('zmuki'))
    o(
      S.periodic(1000)
        .skip(1)
        .scan(a => a + 1, 0)
        .skip(1)
        .map(n => {
          if (n % 2 === 0) {
            return text('hey' + n)
          }
          return counter(n % 5)
        })
    )
  })
)
  .map(p => p(rootNode))
  .run(console.log.bind(console), defaultScheduler)
