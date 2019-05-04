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
    const [statesO, states] = S.proxy()
    const dmap = new Map()
    const srun = (f,s) => 
    const reduce = s => e => {
      if (e instanceof S.Next) {
      } else if (e instanceof S.End) {
        dmap.delete(s)
        if (dmap.size === 0) o(e)
      } else o(e)
    }
    const pmap = (pith: SNPith<State>): NPith => (o, i) => {
      const reducers: Array<(State) => State> = []
      const rs = S.d(state_ => {
        var state = state_
        for (var i = 0, l = reducers.length; i < l; i++) state = reducers[i](state)
        return state
      })
      pith(
        Object.assign(v => o(ssmap(v => ring(v), v)), o, {
          reduce: v => {
            if (v instanceof S.S) {
              dmap.set(v, v.run(reduce(v)))
            } else reducers.push(v)
          }
        }),
        { ...i, states }
      )
      dmap.set(rs, rs.run(reduce(rs)))
    }
    const ring = (sn: SN<State>): N => {
      if (sn.type === 'sElement') {
        return Nelm(sn.tag, pmap(sn.pith), sn.key)
      } else if (sn.type === 'sElementNS') {
        return NelmNS(sn.ns, sn.tag, pmap(sn.pith))
      } else return sn
    }
    const ps = Nrun(ring(sn)).run(e => {
        if (e instanceof S.Next) {
          e.value(node)
        } else if (e instanceof S.End) {
          if (--dc === 0) o(e)
        } else o(e)
      })
    o(
      S.delay(() => {
        o(
            .run(e => {
              if (e instanceof S.Next) {
                state = (e: S.Next<(State) => State>).value(state)
                statesO(state)
                o(S.next(state))
              } else if (e instanceof S.End) {
                if (--dc === 0) o(e)
              } else o(e)
            })
        )
      }, 1)
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
