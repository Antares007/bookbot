// @flow strict-local
import { S, Subject } from './stream'
import { defaultScheduler } from './scheduler'
import { pith, elm, text, run, on } from './dom'

const counter = (d: number) =>
  elm('div', [], (o, a) => {
    o(
      elm('button', [on('click', e => +1)], (o, a) => {
        o(text('+'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      elm('button', [on('click', e => -1)], (o, a) => {
        o(text('-'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(a.scan((a, b) => a + b, 0).map(n => text(n + '')))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

run(pith(o => o(counter(3))))
  .map(p => p(rootNode))
  .run(console.log.bind(console), defaultScheduler)
