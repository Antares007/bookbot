// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import { now, delay } from './scheduler'

const elm = (tag: string, xpith) =>
  new P.PNode(
    () => document.createElement(tag),
    n => n.nodeName === tag.toUpperCase(),
    xpith
  )
const text = (stext: S.S<string>) =>
  new P.PNode(
    () => document.createTextNode(''),
    n => n.nodeName === '#text',
    S.at(
      new P.Pith(o =>
        o(
          stext.map(
            text =>
              new P.Patch(n => {
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
    new P.Pith(o => {
      o(
        elm(
          'button',
          new P.Pith(o => {
            o(text(S.at('+')))
            d > 0 && o(counter(d - 1))
          })
        )
      )
      o(
        elm(
          'button',
          new P.Pith(o => {
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
P.run(S.at(new P.Pith(o => o(counter(3)))))
  .filter2(x => (x instanceof P.Patch ? x : null))
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
