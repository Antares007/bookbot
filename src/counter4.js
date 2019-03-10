// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

const Counter = (d: number, key: string) =>
  D.elm('div', (oo, ons) => {
    let o = D.omap(
      s => {
        if (typeof s[key] === 'object') return (s[key]: { n: number })
        return { n: 0 }
      },
      (s, n) => {
        return { ...s, [key]: n }
      },
      oo
    )
    o(
      D.elm('button', (o, ons) => {
        o(D.str('+'))
        o(ons.click().map(_ => D.r(s => ({ ...s, n: s.n + 1 }))))
        d > 0 && o(Counter(d - 1, '+'))
      })
    )
    o(
      D.elm('button', (o, ons) => {
        o(D.str('-'))
        o(ons.click().map(_ => D.r(s => ({ ...s, n: s.n - 1 }))))
        d > 0 && o(Counter(d - 1, '-'))
      })
    )
    o(D.str('0'))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(D.pith(o => o(Counter(1, 'counter'))))
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
    else console.log(JSON.stringify(e, null, '  '))
  })
