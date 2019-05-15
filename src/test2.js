// @flow strict
import * as S from './S'
import { elm, run, text, node, patch } from './test'
import { linearPatcher } from './N/patchers'

const counter = (depth: number) =>
  elm('div', (o, i) => {
    o(
      node(
        elm('button', (o, i) => {
          o(node(S.d(text('+'))))
          depth > 0 && o(node(counter(depth - 1)))
        })
      )
    )
    o(
      node(
        elm('button', (o, i) => {
          o(node(S.d(text('-'))))
          depth > 0 && o(node(counter(depth - 1)))
        })
      )
    )
    o(node(S.d(text('0'))))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root')

run(o => o(node(counter(0))))
  //.tap(linearPatcher(rootNode, 17))
  .tap(p => p(rootNode))
  .run(console.log.bind(console))
