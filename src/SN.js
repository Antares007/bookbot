// @flow strict
import * as S from './S'
import * as N from './N'

export class R<S> {
  r: S => S
  constructor(r: S => S) {
    this.r = r
  }
}

export class SN<State> extends N.N<{ states: S.S<State> }, R<State>> {
  constructor(
    create: $PropertyType<SN<State>, 'create'>,
    eq: $PropertyType<SN<State>, 'eq'>,
    pith: $PropertyType<SN<State>, 'pith'>
  ) {
    super(create, eq, pith)
  }
}

export function run<State>(
  node: HTMLElement,
  s: State,
  n: SN<State>
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
          if (e instanceof S.Event)
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

export const elm = <State>(
  tag: string,
  pith: $PropertyType<SN<State>, 'pith'>,
  key?: ?string
): SN<State> => {
  const TAG = tag.toUpperCase()
  return new SN(
    () => document.createElement(tag),
    n =>
      n instanceof HTMLElement &&
      n.nodeName === TAG &&
      (key == null || n.dataset.key === key)
        ? n
        : null,
    pith
  )
}
