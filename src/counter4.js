// @flow strict
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

const btn = (a, pith) => D.elm('button', [D.action({ click: e => a })], pith)
const Counter = (d: number) =>
  D.elm('div', [], (o, acts) => {
    o(
      D.elm('button', [D.action({ click: e => +1 })], o => {
        o(D.str('+'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('button', [D.action({ click: e => -1 })], o => {
        o(D.str('-'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('div', [], o => o(D.str(acts.scan((a, b) => a + b, 0).map(String))))
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(D.pith(o => o(Counter(1))))
  .map(p => p.v(rootNode))
  .run(e => {
    if (e instanceof Error) console.error(e)
    else if (e instanceof S.End) console.log(e)
  })
