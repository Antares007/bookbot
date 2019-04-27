// @flow strict
import * as S from './S'
import * as N from './N'

const counter = (d: number): N.N<{ n: number }> =>
  N.elm('div', (o, i) => {
    o.node(
      N.elm('button', (o, i) => {
        const on = new S.On(i.ref)
        o.reduce(on.click().map(_ => s => ({ ...s, n: s.n + 1 })))
        o.node(N.text('+'))
        d > 0 && o.node(N.extend('+', { n: 0 })(counter(d - 1)))
      })
    )
    o.node(
      N.elm('button', (o, i) => {
        const on = new S.On(i.ref)
        o.reduce(on.click().map(_ => s => ({ ...s, n: s.n - 1 })))
        o.node(N.text('-'))
        d > 0 && o.node(N.extend('-', { n: 0 })(counter(d - 1)))
      })
    )
    o.node(i.states.map(s => N.text(s.n + '')))
    o.node(i.states.map(s => N.comment(` ${s.n} `)))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const states = N.runO(rootNode, { n: 0, b: true }, counter(2))

states.take(30).run(e => {
  if (e instanceof S.Next) console.log(JSON.stringify(e.value, null, '  '))
  else if (e instanceof Error) console.error(e)
  else console.info(e)
})
