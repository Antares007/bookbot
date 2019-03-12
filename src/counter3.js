// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import * as M from './m'
import { now, delay } from './scheduler'

const elm = (tag: string, pith) =>
  P.node(
    () => document.createElement(tag),
    n => n.nodeName === tag.toUpperCase(),
    P.bark(pith)
  )
const text = (stext: S.S<string>) =>
  P.node(
    () => document.createTextNode(''),
    n => n.nodeName === '#text',
    stext.map(text =>
      P.patch(n => {
        n.textContent = text
      })
    )
  )

const counter = (d: number) =>
  elm('div', o => {
    o(
      elm('button', o => {
        o(text(S.at('+')))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      elm('button', o => {
        o(text(S.at('-')))
        d > 0 && o(counter(d - 1))
      })
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
const patches = []
P.bark(o => o(counter(3))).run(e => {
  if (e instanceof Error) throw e
  else if (e instanceof S.End) {
    const t0 = now()
    const run = () => {
      const p = patches.shift()
      if (p) {
        p.value.v(rootNode)
        delay(run, 100)
      }
    }
    delay(run)
  } else {
    patches.push(e)
  }
})
