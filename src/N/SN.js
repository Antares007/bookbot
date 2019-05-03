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
    var state = initState
    const statesO = []
    const states = S.s(o => {
      statesO.push(o)
      o(
        D.create(() => {
          const pos = statesO.indexOf(o)
          if (pos >= 0) statesO.splice(pos, 1)
        })
      )
      o(
        S.delay(() => {
          o(S.next(state))
        })
      )
    })
    const reducers: Array<(State) => State> = []
    const reducerss: Array<S.S<(State) => State>> = []
    const pmap = (pith: SNPith<State>): NPith => (o, i) =>
      pith(
        Object.assign(v => o(ssmap(v => ring(v), v)), o, {
          reduce: v => {
            if (v instanceof S.S) reducerss.push(v)
            else reducers.push(v)
          }
        }),
        { ...i, states }
      )
    const ring = (sn: SN<State>): N => {
      if (sn.type === 'sElement') {
        return Nelm(sn.tag, pmap(sn.pith), sn.key)
      } else if (sn.type === 'sElementNS') {
        return NelmNS(sn.ns, sn.tag, pmap(sn.pith))
      } else return sn
    }
    var dc = 2
    o(
      Nrun(ring(sn)).run(e => {
        if (e instanceof S.Next) {
          e.value(node)
        } else if (e instanceof S.End) {
          if (--dc === 0) o(e)
        } else o(e)
      })
    )
    o(
      S.delay(() => {
        console.log('reducerss', reducerss)
        o(
          S.d(state_ => {
            var state = state_
            for (var i = 0, l = reducers.length; i < l; i++) state = reducers[i](state)
            return state
          })
            .merge(mergeArray(reducerss))
            .run(e => {
              if (e instanceof S.Next) {
                state = (e: S.Next<(State) => State>).value(state)
                const nextState = S.next(state)
                o(nextState)
                statesO.forEach(o => o(S.delay(() => o(nextState))))
              } else if (e instanceof S.End) {
                if (--dc === 0) o(e)
              } else o(e)
            })
        )
      })
    )
  })
}

function mergeArray<A>(array: Array<S.S<A>>): S.S<A> {
  return S.s(o => {
    const dmap = new Map()
    o(D.create(() => dmap.forEach(d => d.dispose())))
    array.forEach((as, i) => {
      dmap.set(
        i,
        as.run(e => {
          if (e instanceof S.End) {
            dmap.delete(i)
            if (dmap.size === 0) o(e)
          } else o(e)
        })
      )
    })
  })
}
