// @flow strict
import * as S from './stream2'
import * as N from './pnode2'
import { now } from './scheduler2'

const elm = <A>(tag: string, xpith: S.S<N.Pith<A>> | N.Pith<A>): N.PNode<A> =>
  N.PNode.of(
    () => document.createElement(tag),
    n => n.nodeName === tag.toUpperCase(),
    xpith instanceof S.S ? xpith : S.at(xpith)
  )
const text = (stext: S.S<string>) =>
  N.PNode.of(
    () => document.createTextNode(''),
    n => n.nodeName === '#text',
    S.at(
      N.Pith.of(o =>
        o(
          stext.map(text =>
            N.Patch.of(n => {
              n.textContent = text
            })
          )
        )
      )
    )
  )

const counter = (d: number) =>
  elm(
    'div',
    N.Pith.of(o => {
      o(S.at(1))
      o(
        elm(
          'button',
          N.Pith.of(o => {
            o(S.at(''))

            o(text(S.at('+')))
            d > 0 && o(counter(d - 1))
          })
        )
      )
      o(
        elm(
          'button',
          N.Pith.of(o => {
            o(text(S.at('-')))
            d > 0 && o(counter(d - 1))
          })
        )
      )
    })
  )

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const t0 = now()
N.run(S.at(N.Pith.of(o => o(counter(3)))))
  .map(p => {
    return p instanceof N.Patch ? (p.v(rootNode), 1) : 0
  })
  .scan((a, b) => a + b, 0)
  .skip(1)
  .map(n => ({ n, t: now() - t0 }))
  .run(console.log.bind(console))

// const s = S.take(3, S.skip(1, S.startWith(-1, S.periodic(1000))))
// S.run(console.log.bind(console), s)
