// @flow strict-local
import { mkOn } from './on'
import { run, elm, text } from './node'
import { defaultScheduler } from './scheduler'
import { S } from './stream'

const counter = d =>
  elm('div', (o, n) => {
    const on = mkOn(n)
    o(
      elm('button', o => {
        o(text('+'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      elm('button', o => {
        o(text('-'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      on('click')
        .map(e => (e.target instanceof Node ? e.target.textContent[0] : ''))
        .map(str => (str === '+' ? 1 : str === '-' ? -1 : 0))
        .scan((a, b) => a + b, 0)
        .map(n => text(n + ''))
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

run(
  rootNode,
  S.periodic(1000)
    .scan(a => a + 1, 0)
    .map(n => counter(n % 5))
)
  .map(p => p())
  .run(console.log.bind(console), defaultScheduler)
