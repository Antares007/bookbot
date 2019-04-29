// @flow strict
import * as S from './S'
import * as N from './N'

const pi2 = Math.PI * 2
const r = 10

const button = (label, action, styles, depth) =>
  N.button((o, i) => {
    o(label)
    o.style({ position: 'relative', outline: 'none' })
    o.style(styles)
    o.reduce(i.on.click().map(_ => s => ({ ...s, n: s.n + action })))
    depth > 0 && o(N.extend('+', { n: 0 })(counter(depth - 1)))
  })

const counter = (depth: number): N.N<{ n: number }> =>
  N.div((o, i) => {
    o.style({ padding: '5px 10px', 'text-align': 'center' })
    const colors = S.periodic(20)
      .scan(i => (i >= pi2 ? 0 : i + 0.15), 0)
      .map(i => {
        const s = Math.sin(i)
        const c = Math.cos(i)
        const c1 = 100 + depth * 20 + Math.floor(30 * s)
        const c2 = 100 + depth * 20 + Math.floor(30 * c)
        return { s, c, c1, c2 }
      })

    o(
      button(
        '+',
        1,
        S.map(({ s, c, c1, c2 }) => {
          return {
            'border-radius': Math.abs(Math.floor(s * 20)) + 'px',
            //left: Math.floor(r * c) + 'px',
            //top: Math.floor(r * s) + 'px',
            'background-color': `rgb(255, ${c1}, ${c2})`
          }
        }, colors),
        depth
      ),
      button(
        '-',
        -1,
        S.map(({ s, c, c1, c2 }) => {
          return {
            'border-radius': Math.abs(Math.floor(c * 20)) + 'px',
            //left: Math.floor(r * s) + 'px',
            //top: Math.floor(r * c) + 'px',
            'background-color': `rgb(${c1}, ${c2}, 255)`
          }
        }, colors),
        depth
      ),
      i.states.map(s => s.n + '')
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
