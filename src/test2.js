// @flow strict
import * as S from './S'
import { elm, run, text, node, patch } from './test4'
import { linearPatcher, animationFramePatcher } from './N/patchers'

const counter = (depth: number) =>
  elm(
    'div',
    (o, i) => {
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
    },
    'counter' + depth
  )

const rootNode = document.getElementById('root-node')
const arrays = [[1, 2, 3], [3, 1, 2]]
if (!rootNode) throw new Error()
const d = run(o => {
  o(node(S.periodic(400).map(i => counter(i % 3))))
  o(
    node(
      S.periodic(500)
        .map(i => arrays[i % 2])
        .map(list =>
          elm('ul', o => {
            for (let li of list) {
              o(
                node(
                  elm(
                    'li',
                    o => o(node(S.periodic(li * 30).map(i => text(li + '.' + i)))),
                    'k' + li
                  )
                )
              )
              o(node(counter(li)))
            }
          })
        )
    )
  )
})(rootNode)
S.delay(() => d.dispose(), 8000)
