// @flow strict
import * as S from '../S'
import * as N from './N'

export class R<State> {
  r: State => State
  constructor(r: State => State) {
    this.r = r
  }
}
export const r = <State>(f: State => State): R<State> => new R(f)

export function srun<State>(
  elm: HTMLElement,
  s: State,
  d: N.N<{ states: S.S<State> }, R<State>>
): S.S<State> {
  var proxyO
  const states = S.s(o => ((proxyO = o), void 0)).multicast()
  return S.s(o =>
    o(
      N.run(elm, { states }, d)
        .scan((s, r) => r.r(s), s)
        .run(e => {
          if (e instanceof S.Next) o(S.delay(() => proxyO(e), 1))
          o(e)
        })
    )
  )
}
