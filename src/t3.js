// @flow strict
import * as S from './t'
import * as N from './t2'
import * as D from './S/Disposable'
import * as P from './pith'

type R<State> = N.R | { R: 'reducer', r: State => State }
type SN<State> = { T: 'element', tag: string, s: S.S<R<State>>, key?: string }

type ORay<State> = { T: 'reduce', s: S.S<(State) => State> } | { T: 'snode', s: S.S<SN<State>> }
type IRay<State> = { state: S.S<State> }
type Pith<State> = P.Pith<N.NORay | ORay<State>, N.NIRay & IRay<State>, void>

const snode = <State>(ss: N.SS<SN<State>>): ORay<State> => ({
  T: 'snode',
  s: ss.T === 's' ? ss : S.d(ss)
})
const reduce = <State>(ss: N.SS<(State) => State>): ORay<State> => ({
  T: 'reduce',
  s: typeof ss === 'function' ? S.d(ss) : ss
})

const elm = <State>(tag: string, pith: Pith<State>, key?: string): SN<State> => ({
  T: 'element',
  tag: tag.toUpperCase(),
  s: run(pith),
  key
})

function run<State>(pith: Pith<State>): S.S<R<State>> {
  throw new Error()
}

run<{ n: number }>((o, i) => {
  o(
    N.node(
      N.elm('div', (o, i) => {
        o(N.node(N.text('hello')))
      })
    )
  )
  o(
    snode(
      elm('div', (o, i) => {
        i.state
        o(reduce(a => a))
        o(N.node(N.text('hello')))
      })
    )
  )
})
