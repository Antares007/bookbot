// @flow
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

const castTo = <A: { [string]: mixed }>(a: A, x: mixed): ?A => {
  if (x == null) return
}

const pmap = <A: any, B: any>(
  key: string,
  b: B,
  pith: D.PithT<B>
): D.PithT<A> =>
  D.pith((o, on, s) =>
    pith.pith(
      v => {
        if (v instanceof S.S)
          o(
            v.map(x =>
              x instanceof D.RT
                ? D.r((a: A) => ({ ...a, [key]: x.r(a[key] || b) }))
                : x
            )
          )
        else if (v instanceof D.ElmT)
          o(D.elm(v.tag, v.piths.map(pith => pmap(key, b, pith)), v.key))
        else o(v)
      },
      on,
      s.map(x => {
        if (typeof x[key] === 'object') return x[key]
        return b
      })
    )
  )
const emap = <A: any, B: any>(key: string, b: B, elm: D.ElmT<B>): D.ElmT<A> =>
  D.elm(elm.tag, elm.piths.map(pith => pmap(key, b, pith)), elm.key)

const Counter = (d: number, key: string): D.ElmT<{ n: number }> =>
  D.elm(
    'div',
    D.pith((o, on, s) => {
      o(
        D.elm('button', (o, on, s) => {
          o(D.str('+'))
          o(on.click().map(_ => D.r(s => ({ ...s, n: s.n + 1 }))))
          d > 0 && o(emap('+', { n: 0 }, Counter(d - 1, '+')))
        })
      )

      o(
        D.elm('button', (o, on, s) => {
          o(D.str('-'))
          o(on.click().map(_ => D.r(s => ({ ...s, n: s.n - 1 }))))
          d > 0 && o(emap('-', { n: 0 }, Counter(d - 1, '-')))
        })
      )

      const rez = on
        .click()
        .map(e => e.target)
        .filter2(x => (x instanceof HTMLButtonElement ? x : null))
        .map(x => x.textContent[0])
        .map(x => (x === '+' ? 1 : x === '-' ? -1 : 0))
        .scan((a, b) => a + b, 0)
        .map(String)

      o(D.str('0'))
    })
  )

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(S.at(D.pith(o => o(Counter(3, '+-')))))
  .scan(
    (s, x) => {
      if (x instanceof P.PatchT) {
        x.v(rootNode)
        return s
      }
      return x.r(s)
    },
    { n: 0 }
  )
  .skipEquals()
  .run(e => {
    if (e instanceof Error) console.error(e)
    else if (e instanceof S.End) console.log('The end')
    else console.log(JSON.stringify(e.value, null, '  '))
  })
