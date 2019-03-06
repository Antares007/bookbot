// @flow strict
import * as S from './stream2'
import * as D from './dom2'

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
    o(D.str(acts.scan((a, b) => a + b, 0).map(n => String(n))))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
