// @flow strict
import * as S from '../S'
import type { N, NORay, NIRay, NPith } from './N2'
import type { SS } from './streamstaff'
import { ssmap } from './streamstaff'
import { run as Nrun, elm as Nelm, elmNS as NelmNS } from './N2'

export type SNORay<State> = {
  ...NORay,
  snode: (SS<SN<State>>) => void,
  reduce: (SS<(State) => State>) => void
}
export type SNIRay<State> = { ...NIRay, states: S.S<State> }

export type SNPith<State> = (SNORay<State>, SNIRay<State>) => void

export type SN<State> =
  | N
  | { type: 'sElement', tag: string, pith: SNPith<State>, key: ?string }
  | { type: 'sElementNS', tag: string, pith: SNPith<State>, ns: string }

function run<State>(initState: State, sn: SN<State>): S.S<State> {
  const stateProxy = S.s(o => {})
  const reducers: Array<(State) => State> = []
  const reducerss: Array<S.S<(State) => State>> = []
  const pmap = (pith: SNPith<State>): NPith => (o, i) =>
    pith(
      {
        ...o,
        snode: v => o.node(ssmap(ring, v)),
        reduce: v => {
          if (v instanceof S.S) reducerss.push(v)
          else reducers.push(v)
        }
      },
      { ...i, states: stateProxy }
    )
  const ring = (sn: SN<State>): N => {
    if (sn.type === 'sElement') {
      return Nelm(sn.tag, pmap(sn.pith), sn.key)
    } else if (sn.type === 'sElementNS') {
      return NelmNS(sn.ns, sn.tag, pmap(sn.pith))
    } else return sn
  }
  return S.s(o => {
    const patches = Nrun(ring(sn))
    //
  })
}
