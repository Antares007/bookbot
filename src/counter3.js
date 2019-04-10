// @flow strict
import * as S from './S'
import * as N from './N'
import * as Rings from './N/rings/'

const counter = (d: number) =>
  N.elm('div', (o, i) => {
    o(
      N.elm('button', (o, i) => {
        o(N.text('+'))
        //o(i.on.click().map(e => N.r(s => ({ ...s, n: s.n + 1 }))))
        d > 0 && o(counter(d - 1).pmap(Rings.extend('+', { n: 0 })))
      })
    )
    o(N.text(i.states.map(s => s.n + '')))
  })

const napp = counter(1)

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

N.srun(rootNode, { n: 0 }, napp).run(e => {
  if (e instanceof S.Next) {
    const ns = JSON.stringify(e.value, null, '  ')
    localStorage.setItem('s', ns)
    console.log(ns)
  } else console.info(e)
})
