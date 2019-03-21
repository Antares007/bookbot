// @flow strict
import * as S from './S'
import * as SPith from './SPith'
import * as N from './N'
import * as SN from './SN'
import * as On from './on'

const counter = (d: number): SN.T<{ n: number }> =>
  SN.elm('div', o => {
    o(
      N.elm(
        'button',
        SPith.pmap(N.ringOn, (o, { on }) => {
          o(N.text('+'))
          o(
            on
              .click()
              .take(3)
              .map(e => SN.r(s => ({ ...s, n: s.n + 1 })))
          )
          d > 0 && o(counter(d - 1))
        })
      )
    )
    o(
      N.elm('button', o => {
        o(N.text(S.at('-')))
        d > 0 && o(counter(d - 1))
      })
    )
  })

const napp = counter(3)

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

N.run(rootNode, napp).run(console.log.bind(console))

const patches = []
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
