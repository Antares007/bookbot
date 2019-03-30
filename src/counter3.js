// @flow
import * as S from './S'
import type { NPith } from './N'
import * as N from './N'
import * as SN from './SN'

const counter = (d: number) =>
  N.elm(
    'div',
    S.d((o, i) => {
      o(
        N.elm(
          'button',
          S.d((o, i) => {
            o(N.text('+'))
            o(
              i.on
                .click()
                .map(e => SN.r(s => s + 1))
                .map(select('n'))
            )
            d > 0 && o(counter(d - 1).pmap(ringState('+', { n: 0 })))
          }).map(N.ringOn)
        )
      )
      o(
        N.elm(
          'button',
          S.d((o, i) => {
            o(N.text(S.d('-')))
            o(
              i.on
                .click()
                .map(e => SN.r(s => s - 1))
                .map(select('n'))
            )
            d > 0 && o(counter(d - 1).pmap(ringState('-', { n: 0 })))
          }).map(N.ringOn)
        )
      )
      o(N.text(i.states.map(s => s.n + '')))
    })
  )

const napp = counter(2)

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

SN.run(rootNode, { n: 0 }, napp).run(e => {
  if (e instanceof S.Event) console.log(JSON.stringify(e.value, null, '  '))
  else console.info(e)
})

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

function select<A: any, B: any>(key: string): (SN.R<B>) => SN.R<A> {
  return function(rb) {
    return SN.r((a: A) => ({ ...a, [key]: rb.r(a[key]) }))
  }
}

function ringState<A: any, B: any>(
  key: string,
  b: B
): (NPith<{ states: S.S<B> }, SN.R<B>>) => NPith<{ states: S.S<A> }, SN.R<A>> {
  return function map(pith) {
    return (o, i) =>
      pith(
        v => {
          if (v instanceof S.S)
            o(
              v.map(x =>
                x instanceof SN.R
                  ? SN.r((a: A) => ({ ...a, [key]: x.r(a[key] || b) }))
                  : x
              )
            )
          else o(v.pmap(map))
        },
        {
          states: i.states.map(s => {
            if (typeof s[key] === 'object') return s[key]
            return b
          })
        }
      )
  }
}
