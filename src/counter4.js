// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

const Counter = (d: number) =>
  D.elm('div', (o, ons) => {
    o(
      D.elm('button', o => {
        o(D.str('+'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('button', o => {
        let see = P.patch(n => {})
        o(D.str('-'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('div', o =>
        o(
          D.str(
            ons
              .flatMap(on => on('click'))
              .map(e => 1)
              .scan((a, b) => a + b, 0)
              .map(String)
          )
        )
      )
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(D.pith(o => o(Counter(1))))
  .filter2(x => (x instanceof P.PPatch ? x : null))
  .map(p => p.v(rootNode))
  .run(e => {
    if (e instanceof Error) console.error(e)
    else if (e instanceof S.End) console.log(e)
  })
