// @flow
import * as S from './S'
import * as N from './piths/p'
import type { SS } from './piths/p'

const counter = (d: number): N.N<{ n: number }> =>
  N.elm('div', (o, i) => {
    o.node(
      N.elm('button', (o, i) => {
        const on = new S.On(i.ref)
        o.reduce(on.click().map(_ => s => ({ ...s, n: s.n + 1 })))
        o.node(N.text('+'))
        d > 0 && o.node(extend('+', { n: 0 })(counter(d - 1)))
      })
    )
    o.node(
      N.elm('button', (o, i) => {
        const on = new S.On(i.ref)
        o.reduce(on.click().map(_ => s => ({ ...s, n: s.n - 1 })))
        o.node(N.text('-'))
        d > 0 && o.node(extend('-', { n: 0 })(counter(d - 1)))
      })
    )
    o.node(i.states.map(s => N.text(s.n + '')))
    o.node(i.states.map(s => N.comment(` ${s.n} `)))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

N.runO(rootNode, { n: 0, b: true }, counter(2)).run(e => {
  if (e instanceof S.Next) console.log(JSON.stringify(e.value, null, '  '))
  else if (e instanceof Error) console.error(e)
  else console.info(e)
})

function ssmap<A, B>(f: A => B, ss: SS<A>): SS<B> {
  return ss instanceof S.S ? ss.map(f) : f(ss)
}

function extend<A: any, B: any>(key: string, b: B): (N.N<B>) => N.N<A> {
  return nb =>
    nb.type === 'element'
      ? N.elm(nb.tag, (o, i) => {
          nb.pith(
            {
              node: ss => o.node(ssmap(extend(key, b), ss)),
              patch: o.patch,
              reduce: ss => o.reduce(ssmap(v => a => ({ ...a, [key]: v(a[key] || b) }), ss))
            },
            {
              ref: i.ref,
              states: i.states.map(s => {
                if (typeof s[key] === 'object') return s[key]
                return b
              })
            }
          )
        })
      : nb
}
