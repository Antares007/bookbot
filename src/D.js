// @flow strict
import * as S from './S'
import * as N from './N'
import type { NPith } from './N'

export class R<State> {
  r: State => State
  constructor(r: State => State) {
    this.r = r
  }
}
export const r = <State>(f: State => State): R<State> => new R(f)

let see = N.node(
  () => document.createElement('div'),
  n => null,
  S.d((o, i) => {
    o(S.d(r(s => s)))
    o(S.d(new Props()))
    o(S.d(new Attrs()))
  })
).pmap(p => extend('', { aaa: 1, bbb: '' })(props(attrs(on(p)))))

let see2 = run(document.createElement('div'), { a: 42 }, see)

function extend<A, B>(
  key: string,
  b: B
): (NPith<{ states: S.S<B> }, R<B>>) => NPith<{ states: S.S<A> }, R<A>> {
  throw new Error()
}
function on<I, O>(
  p: NPith<{ ...I, on: S.On, ref: S.S<Node> }, O>
): NPith<I, O> {
  throw new Error()
}
class Attrs {}
function attrs<I, O>(p: NPith<I, O | Attrs>): NPith<I, O> {
  throw new Error()
}
class Props {}
function props<I, O>(p: NPith<I, O | Props>): NPith<I, O> {
  throw new Error()
}

function run<State>(
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
