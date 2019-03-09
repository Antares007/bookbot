// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

const Counter = (d: number) =>
  D.elm('div', (o, ons) => {
    let oo = D.omap(s => s.o.b, (s, b) => ({ ...s, o: { ...s.o, b } }), o)
    oo(
      D.elm('div', o => {
        o(S.at(D.r(s => s + 1)))
      })
    )
    o(
      D.elm('button', o => {
        o(
          S.at(
            P.patch(n => {
              if (n instanceof HTMLElement) n.setAttribute('id', 'inc')
            })
          )
        )
        o(D.str('+'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('button', o => {
        o(
          S.at(
            P.patch(n => {
              if (n instanceof HTMLElement) n.setAttribute('id', 'dec')
            })
          )
        )
        o(D.str('-'))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.str(
        ons
          .flatMap(on => on.click())
          .map(e => {
            if (!(e.target instanceof HTMLElement)) return 0
            const id = e.target.getAttribute('id')
            return id === 'inc' ? 1 : id === 'dec' ? -1 : 0
          })
          .scan((a, b) => a + b, 0)
          .map(String)
      )
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(D.pith(o => o(Counter(1))))
  .scan(
    (s, x) => {
      if (x instanceof P.PPatch) {
        x.v(rootNode)
        return s
      }
      return x.r(s)
    },
    { a: 43, o: { b: 0 } }
  )
  //.filter2(x => (x instanceof P.PPatch ? x : null))
  //.map(p => p.v(rootNode))
  .skipEquals()
  .run(e => {
    if (e instanceof Error) console.error(e)
    else console.log(e)
  })
