// @flow strict
import * as S from './t'
import { elm, elementBark, text, node, patch } from './t4'
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
const arrays = [[1, 2, 3], [3, 2, 1]]
if (!rootNode) throw new Error()
const s = elementBark((o, i) => {
  o(node(S.map(i => counter(i % 3), S.scan(a => a + 1, -1, S.periodic(400)))))
  const strs = S.map(f => f(), S.d(() => window.a()))
  o(node(elm('div', o => window.a())))
  o(
    node(
      S.map(
        list =>
          elm('ul', o => {
            for (let li of list) {
              o(
                node(
                  elm(
                    'li',
                    o => {
                      o(node(text(li + ')')))
                      o(node(counter(li - 1)))
                    },
                    'k' + li
                  )
                )
              )
            }
          }),
        S.map(i => arrays[i % 2], S.scan(a => a + 1, -1, S.periodic(400)))
      )
    )
  )
})
