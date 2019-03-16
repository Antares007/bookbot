// @flow strict
import * as S from './stream'
import * as N from './n'
import * as M from './m'
import { now, delay } from './scheduler'

const counter = (d: number) =>
  N.elm('div', o => {
    o(
      N.elm('button', o => {
        o(N.text(S.at('+')))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      N.elm('button', o => {
        o(N.text(S.at('-')))
        d > 0 && o(counter(d - 1))
      })
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
const patches = []
const rez = counter(3)
rez.patches.run(e => {
  if (e instanceof Error) throw e
  else if (e instanceof S.End) {
    const t0 = now()
    const run = () => {
      const p = patches.shift()
      if (p) {
        p.value.patch(rootNode)
        delay(run, 100)
      }
    }
    delay(run)
  } else {
    patches.push(e)
  }
})
