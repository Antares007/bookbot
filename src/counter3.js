// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import { now, delay } from './scheduler'

const elm = (tag: string, xpith) =>
  P.node(
    () => document.createElement(tag),
    n => n.nodeName === tag.toUpperCase(),
    S.at(xpith)
  )
const text = (stext: S.S<string>) =>
  P.node(
    () => document.createTextNode(''),
    n => n.nodeName === '#text',
    S.at(
      P.pith(o =>
        o(
          stext.map(text =>
            P.patch(n => {
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
    P.pith(o => {
      o(
        elm(
          'button',
          P.pith(o => {
            o(text(S.at('+')))
            d > 0 && o(counter(d - 1))
          })
        )
      )
      o(
        elm(
          'button',
          P.pith(o => {
            o(text(S.at('-')))
            d > 0 && o(counter(d - 1))
          })
        )
      )
    })
  )

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
const patches = []
P.run(S.at(P.pith(o => o(counter(3)))))
  .filter2(x => (x instanceof P.PatchT ? x : null))
  .run(e => {
    if (e instanceof Error) throw e
    else if (e instanceof S.End) {
      const t0 = now()
      const run = () => {
        const p = patches.shift()
        if (p) {
          console.log(now() - t0)
          p.value.v(rootNode)
          delay(run, 300)
        }
      }
      delay(run)
    } else {
      patches.push(e)
    }
  })
