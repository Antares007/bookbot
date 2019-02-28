// @flow strict-local
import type { On } from './on'
import { mkOn } from './on'
import type { PNode$Node, PNode$Pith } from './pnode'
import { run, node, pith } from './pnode'
import { defaultScheduler } from './scheduler'
import { S } from './stream'

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
  elm('div', o => {
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
