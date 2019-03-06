// @flow strict
import * as S from './stream2'
import * as P from './pnode2'
import * as D from './dom2'
import { now, delay } from './scheduler2.js'

const Counter = (d: number) =>
  D.elm('div', [], (o, acts) => {
    o(
      D.elm('button', [D.action('click', e => +1)], o => {
        o(D.str('+'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('button', [D.action('click', e => -1)], o => {
        o(D.str('-'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('div', [], o =>
        o(D.str(acts.scan((a, b) => a + b, 0).map(n => String(n))))
      )
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const t0 = now()
D.run(D.pith(o => o(Counter(1))))
  .filter2(x => (x instanceof P.Patch ? x : null))
  .map(p => p.v(rootNode))
  .scan(a => a + 1, 0)
  .skip(1)
  .map(n => ({ n, t: now() - t0 }))
  .run(console.log.bind(console))
