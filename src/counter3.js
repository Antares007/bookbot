// @flow strict
import * as S from './stream'
import * as N from './n'
import * as SN from './sn'
import { now, delay } from './scheduler'

const counter = (d: number) =>
  SN.elm('div', o => {
    o(
      N.elm('button', o => {
        o(N.text('+'))
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

const n = counter(3)

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
const patches = []

N.run(rootNode, n).run(console.log.bind(console))

// N.bark(n.pith).run(e => {
//   if (e instanceof Error) throw e
//   else if (e instanceof S.End) {
//     const t0 = now()
//     const run = () => {
//       const p = patches.shift()
//       if (p) {
//         p.value.patch(rootNode)
//         delay(run, ~~(1000 / 60))
//       }
//     }
//     delay(run)
//   } else {
//     patches.push(e)
//   }
// })
