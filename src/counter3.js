// @flow strict
import * as S from './S'
import * as N from './N'

const counter = (d: number): N.N<{ n: number }> =>
  N.div((o, i) => {
    o(
      N.button((o, i) => {
        o('+')
        o.reduce(i.on.click().map(_ => s => ({ ...s, n: s.n + 1 })))
        d > 0 && o(N.extend('+', { n: 0 })(counter(d - 1)))
      }),
      N.button((o, i) => {
        o('-')
        o.reduce(i.on.click().map(_ => s => ({ ...s, n: s.n - 1 })))
        d > 0 && o(N.extend('-', { n: 0 })(counter(d - 1)))
      }),
      i.states.map(s => s.n + ''),
      i.states.map(s => N.comment(` ${s.n} `))
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const states = N.runO(rootNode, { n: 0, b: true }, counter(2))

states.take(30).run(e => {
  if (e instanceof S.Next) console.log(JSON.stringify(e.value, null, '  '))
  else if (e instanceof Error) console.error(e)
  else console.info(e)
})
