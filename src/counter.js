// @flow
import { div, button, h4 } from './N/ctors'
import { run } from './N/SN'

const counter = div<{ n: number }>((o, i) => {
  o(
    button((o, i) => {
      o('+')
      o.reduce(i.on.click().map(e => s => ({ ...s, n: s.n + 1 })))
    })
  )
  o(
    button((o, i) => {
      o('-')
      o.reduce(i.on.click().map(e => s => ({ ...s, n: s.n - 1 })))
    })
  )
  o(h4((o, i) => o(i.states.map(s => s.n + ''))))
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root')

run(p => p(rootNode), { n: 0 }, counter).run(console.log.bind(console))
