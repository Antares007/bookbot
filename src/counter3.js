// @flow
import * as S from './S'
import * as N from './N'

const counter = (d: number) =>
  N.elm<{ n: number }>('div', (o, i) => {
    o(
      N.elm('button', (o, i) => {
        o(N.text('+'))
        o(
          i.on
            .click()
            .map(e => N.r(s => s + 1))
            .map(N.select('n'))
        )
        d > 0 && o(counter(d - 1).pmap(N.ringState('+', { n: 0 })))
      })
    )
    o(
      N.elm('button', (o, i) => {
        o(N.text('-'))
        o(
          i.on
            .click()
            .map(e => N.r(s => s - 1))
            .map(N.select('n'))
        )
        d > 0 && o(counter(d - 1).pmap(N.ringState('-', { n: 0 })))
      })
    )
    o(N.text(i.states.map(s => s.n + '')))
  })

const napp = counter(1)

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

N.run(rootNode, JSON.parse(localStorage.getItem('s') || '{"n":0}'), napp).run(
  e => {
    if (e instanceof S.Next) {
      const ns = JSON.stringify(e.value, null, '  ')
      localStorage.setItem('s', ns)
      console.log(ns)
    } else console.info(e)
  }
)
