// @flow
import { div, button, h4 } from './N/ctors'
import { run } from './N/SN'
import { extend } from './N/rings'

const counter = (depth: number) =>
  div<{ n: number }>((o, i) => {
    o(
      button((o, i) => {
        o('+')
        o.reduce(i.on.click().map(e => s => ({ ...s, n: s.n + 1 })))
        depth > 0 && o(extend('+', { n: 0 })(counter(depth - 1)))
      })
    )
    o(
      button((o, i) => {
        o('-')
        o.reduce(i.on.click().map(e => s => ({ ...s, n: s.n - 1 })))
        depth > 0 && o(extend('-', { n: 0 })(counter(depth - 1)))
      })
    )
    o(h4((o, i) => o(i.states.map(s => s.n + ''))))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root')

run(p => p(rootNode), { n: 0 }, counter(2)).run(console.log.bind(console))
