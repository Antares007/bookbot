// @flow strict
import * as S from './t'
import * as N from './t2'
import * as D from './S/Disposable'
import type { Pith } from './pith'

type R<State> = N.R | { R: 'reducer', r: State => State }
type SN<State> = { T: 'element', tag: string, s: S.S<R<State>>, key?: string }

type SNORay<State> = { T: 'reduce', s: S.S<(State) => State> } | { T: 'snode', s: S.S<SN<State>> }
type SNPith<State> = Pith<N.NORay | SNORay<State>, N.NIRay, void>

const snode = <State>(ss: N.SS<SN<State>>): SNORay<State> => ({
  T: 'snode',
  s: ss.T === 's' ? ss : S.d(ss)
})
const reduce = <State>(ss: N.SS<(State) => State>): SNORay<State> => ({
  T: 'reduce',
  s: typeof ss === 'function' ? S.d(ss) : ss
})

const elm = <State>(tag: string, pith: SNPith<State>, key?: string): SN<State> => ({
  T: 'element',
  tag: tag.toUpperCase(),
  s: run(pith),
  key
})

function run<State>(pith: SNPith<State>): S.S<R<State>> {
  throw new Error()
}

run<{ n: number }>(o => {
  o(
    N.node(
      N.elm('div', o => {
        o(N.node(N.text('hello')))
      })
    )
  )
  o(
    snode(
      elm('div', o => {
        o(reduce(a => a))
        o(N.node(N.text('hello')))
      })
    )
  )
})
