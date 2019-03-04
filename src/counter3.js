// @flow strict
import type { S$pith } from './stream2'
import * as S from './stream2'
import type { PNode$pith } from './pnode2'
import * as N from './pnode2'

const elm = (tag: string, xpith: S$pith<PNode$pith> | PNode$pith) =>
  N.node(
    () => document.createElement(tag),
    n => n.nodeName === tag.toUpperCase(),
    xpith.t === 'S$pith' ? xpith : S.at(xpith)
  )
const text = (stext: S$pith<string>) =>
  N.node(
    () => document.createTextNode(''),
    n => n.nodeName === '#text',
    S.at(
      N.pith(o =>
        o(
          S.map(
            text =>
              N.patch(n => {
                n.textContent = text
              }),
            stext
          )
        )
      )
    )
  )

const counter = (d: number) =>
  elm(
    'div',
    N.pith(o => {
      o(
        elm(
          'button',
          N.pith(o => {
            o(text(S.at('+')))
            d > 0 && o(counter(d - 1))
          })
        )
      )
      o(
        elm(
          'button',
          N.pith(o => {
            o(text(S.at('-')))
            d > 0 && o(counter(d - 1))
          })
        )
      )
    })
  )

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

S.run(
  console.log.bind(console),
  S.scan(
    a => a + 1,
    0,
    S.map(p => p(rootNode), N.run(S.at(N.pith(o => o(counter(3))))))
  )
)

// const s = S.take(3, S.skip(1, S.startWith(-1, S.periodic(1000))))
// S.run(console.log.bind(console), s)
