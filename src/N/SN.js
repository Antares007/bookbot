// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import type { N, NPith, NORay, NIRay } from './N2'
import type { SS } from './streamstaff'
import { ssmap, makeStreamController } from './streamstaff'
import { run as Nrun, elm as Nelm, elmNS as NelmNS } from './N2'

export type SNPith<State> = (
  {
    (SS<SN<State>>): void,
    patch: (SS<(Node) => void>) => void,
    reduce: (SS<(State) => State>) => void
  },
  { ref: S.S<Node>, states: S.S<State> }
) => void

export type SN<State> =
  | N
  | { type: 'sElement', tag: string, pith: SNPith<State>, key: ?string }
  | { type: 'sElementNS', tag: string, pith: SNPith<State>, ns: string }

export const elm = <State>(tag: string, pith: SNPith<State>, key?: ?string): SN<State> => ({
  type: 'sElement',
  tag: tag.toUpperCase(),
  pith,
  key
})
export const elmNS = <State>(ns: string, tag: string, pith: SNPith<State>): SN<State> => ({
  type: 'sElementNS',
  tag: tag.toUpperCase(),
  pith,
  ns
})

export function run<State>(node: Node, initState: State, sn: SN<State>): S.S<State> {
  return S.s(o => {
    const dmap = new Map()
    o(D.create(() => dmap.forEach(d => d.dispose())))
    const srun = <A>(f: (S.Next<A>) => void, s: S.S<A>) =>
      dmap.set(
        s,
        s.run(e => {
          if (e instanceof S.Next) f(e)
          else if (e instanceof S.End) {
            dmap.delete(s)
            if (dmap.size === 0) o(e)
          } else o(e)
        })
      )
    const [statesO, states] = S.proxy()
    var state = initState
    statesO(state)
    const reduce = e => {
      const newState = e.value(state)
      if (newState === state) return
      state = newState
      o(S.next(state))
      statesO(state)
    }
    const pmap = (pith: SNPith<State>): NPith => (o, i) => {
      const reducers: Array<(State) => State> = []
      pith(
        Object.assign(v => o(ssmap(v => ring(v), v)), o, {
          reduce: v => {
            if (v instanceof S.S) {
              srun(reduce, v)
            } else reducers.push(v)
          }
        }),
        { ...i, states }
      )
      if (reducers.length)
        srun(
          reduce,
          S.d(state_ => {
            var state = state_
            for (var i = 0, l = reducers.length; i < l; i++) state = reducers[i](state)
            return state
          })
        )
    }
    const ring = (sn: SN<State>): N => {
      if (sn.type === 'sElement') {
        return Nelm(sn.tag, pmap(sn.pith), sn.key)
      } else if (sn.type === 'sElementNS') {
        return NelmNS(sn.ns, sn.tag, pmap(sn.pith))
      } else return sn
    }
    srun(e => e.value(node), Nrun(ring(sn)))
  })
}
