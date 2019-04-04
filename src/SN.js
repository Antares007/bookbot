// @flow strict
import * as S from './S'
import * as N from './N'

export class R<S> {
  r: S => S
  constructor(r: S => S) {
    this.r = r
  }
}

export function run<State>(
  node: HTMLElement,
  s: State,
  n: N.N<{ states: S.S<State> }, R<State>>
): S.S<State> {
  var proxyO
  const states = S.s(o => ((proxyO = o), void 0)).multicast()
  const nn = n.pmap(function map(pith) {
    return o =>
      pith(
        v => {
          if (v instanceof N.N) {
            o(v.pmap(map))
          } else {
            o(v)
          }
        },
        { states }
      )
  })
  return S.s(o =>
    o(
      N.run(node, nn)
        .scan((s, r) => r.r(s), s)
        .run(e => {
          if (e instanceof S.Next)
            o(
              S.delay(() => {
                proxyO(e)
              }, 1)
            )
          o(e)
        })
    )
  )
}

export const r = <State>(f: State => State): R<State> => new R(f)
