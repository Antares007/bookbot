// @flow strict
import * as S from './stream'
import * as N from './n'
import * as SN from './sn'
import * as On from './on'
import { now, delay } from './scheduler'

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

const ring = <A>(
  pith: On.On => $PropertyType<N.N<A>, 'pith'>
): $PropertyType<N.N<A>, 'pith'> => o => {
  const piths = pith(on(o))
}

const counter = (d: number): SN.SN<{ n: number }> =>
  SN.elm('div', o => {
    o(
      on(o)
        .click()
        .map(e => SN.r(s => s))
        .take(3)
    )

    o(
      N.elm('button', o => {
        o(N.text('+'))
        o(S.at(SN.r(s => ({ ...s, n: s.n + 1 }))))
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
