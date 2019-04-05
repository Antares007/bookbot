// @flow
import * as S from './S'
import type { NPith } from './N'
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
            .map(select('n'))
        )
        d > 0 && o(counter(d - 1).pmap(ringState('+', { n: 0 })))
      })
    )
    o(
      N.elm('button', (o, i) => {
        o(N.text('-'))
        o(
          i.on
            .click()
            .map(e => N.r(s => s - 1))
            .map(select('n'))
        )
        d > 0 && o(counter(d - 1).pmap(ringState('-', { n: 0 })))
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

function select<A: any, B: any>(key: string): (N.R<B>) => N.R<A> {
  return function(rb) {
    return N.r((a: A) => ({ ...a, [key]: rb.r(a[key]) }))
  }
}

function ringState<A: any, B: any>(key: string, b: B): (NPith<B>) => NPith<A> {
  return function map(pith) {
    return (o, i) =>
      pith(
        v => {
          if (v instanceof S.S)
            o(
              v.map(x =>
                x instanceof N.R
                  ? N.r((a: A) => ({ ...a, [key]: x.r(a[key] || b) }))
                  : x
              )
            )
          else o(v.pmap(map))
        },
        {
          ...i,
          states: i.states.map(s => {
            if (typeof s[key] === 'object') return s[key]
            return b
          })
        }
      )
  }
}
