// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import { now, delay } from './scheduler'

const elm = (tag: string, xpith) =>
  P.node(
    () => document.createElement(tag),
    n => n.nodeName === tag.toUpperCase(),
    xpith
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
  .filter2(x => (x instanceof P.PPatch ? x : null))
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

// const t0 = now()
// P.run(S.at(P.Pith(o => o(counter(3)))))
//   .filter2(x => (x instanceof P.Patch ? x : null))
//   .map(p => p.v(rootNode))
//   .scan(a => a + 1, 0)
//   .skip(1)
//   .map(n => ({ n, t: now() - t0 }))
//   .run(console.log.bind(console))

// const s = S.take(3, S.skip(1, S.startWith(-1, S.periodic(1000))))
// S.run(console.log.bind(console), s)
