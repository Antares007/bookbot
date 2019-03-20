// @flow strict
import * as S from './S'
import * as SPith from './SPith'
import * as N from './N'
import * as SN from './SN'
import * as On from './on'
import { now, delay } from './scheduler'

const ringOn = <A, B>(
  pith: ((A | S.S<N.Patch | B>) => void, On.On) => void
): (((A | S.S<N.Patch | B>) => void) => void) => {
  return o => pith(o, on(o))
}

const ref = <A>(o: (S.S<N.Patch | A>) => void): S.S<Node> => {
  var node: ?Node
  o(
    S.at(
      N.patch(n => {
        node = n
      })
    )
  )
  return S.s(os => {
    os(
      S.delay(function rec() {
        if (node) {
          os(S.event(node))
          os(delay(() => os(S.end)))
        } else os(S.delay(rec))
      })
    )
  })
}
const on = <A>(o: (S.S<N.Patch | A>) => void): On.On => new On.On(ref(o))

const counter = (d: number): SN.T<{ n: number }> =>
  SN.elm('div', o => {
    o(
      N.elm(
        'button',
        SPith.pmap(ringOn, (o, on) => {
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
