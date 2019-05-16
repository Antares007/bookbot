// @flow strict
import * as S from './S'
import { elm, run, text, node, patch } from './test'
import { linearPatcher, animationFramePatcher } from './N/patchers'

const counter = (depth: number) =>
  elm('div', (o, i) => {
    o(
      node(
        elm('button', (o, i) => {
          o(node(text('+')))
          depth > 0 && o(node(counter(depth - 1)))
        })
      )
    )
    o(
      node(
        elm('button', (o, i) => {
          o(node(text('-')))
          depth > 0 && o(node(counter(depth - 1)))
        })
      )
    )
    o(node(text('0')))
  })

const rootNode = document.getElementById('root-node')

if (rootNode)
  run(o => o(node(counter(2))))
    //.tap(linearPatcher(rootNode, 1700))
    //.tap(animationFramePatcher(rootNode))
    .tap(p => p(rootNode))
    .run(console.log.bind(console))
