// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

const Counter = (d: number) =>
  D.elm('div', (oo, ons) => {
    let o = D.omap(
      s => {
        if (typeof s.n === 'number') return s.n
        return 0
      },
      (s, n) => {
        return { ...s, n }
      },
      oo
    )
    o(
      D.elm('button', (o, ons) => {
        o(D.str('+'))
        o(ons.click().map(_ => D.r(s => s + 1)))
        //d > 0 && o(Counter(d - 1))
      })
    )
    o(
      D.elm('button', (o, ons) => {
        o(D.str('-'))
        o(ons.click().map(_ => D.r(s => s - 1)))
        //d > 0 && o(Counter(d - 1))
      })
    )
    o(D.str('0'))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(D.pith(o => o(Counter(1))))
  .scan((s, x) => {
    if (x instanceof P.PPatch) {
      x.v(rootNode)
      return s
    }
    return x.r(s)
  }, {})
  .skipEquals()
  .run(e => {
    if (e instanceof Error) console.error(e)
    else console.log(e)
  })
