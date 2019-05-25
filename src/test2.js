// @flow strict
import * as S from './t'
import { elm, run, text, node, patch } from './t2'
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
const s = run(o => {
  o(node(S.map(i => counter(i % 3), S.scan(a => a + 1, -1, S.periodic(400)))))
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
                    o =>
                      o(
                        node(
                          S.map(
                            i => text(li + '.' + i),
                            S.scan(a => a + 1, -1, S.periodic(li * 30))
                          )
                        )
                      ),
                    'k' + li
                  )
                )
              )
              o(node(counter(li)))
            }
          }),
        S.map(i => arrays[i % 2], S.scan(a => a + 1, -1, S.periodic(500)))
      )
    )
  )
})
const d = S.run(e => {
  if (e.R === 'next') e.value(rootNode)
  else console.info(e)
}, s)
S.delay(() => d.dispose(), 8000)
