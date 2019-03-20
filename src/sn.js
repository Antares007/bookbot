// @flow strict
import * as S from './stream'
import * as D from './disposable'
import * as N from './n'

export class R<S> {
  r: S => S
  constructor(r: S => S) {
    this.r = r
  }
}

export class SN<S> extends N.N<void, void, R<S>> {
  constructor(
    create: $PropertyType<SN<S>, 'create'>,
    eq: $PropertyType<SN<S>, 'eq'>,
    pith: $PropertyType<SN<S>, 'pith'>
  ) {
    super(create, eq, pith)
  }
}

export const elm = <S>(
  tag: string,
  pith: $PropertyType<SN<S>, 'pith'>,
  key?: ?string
): SN<S> => {
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

export function run<S>(node: HTMLElement, s: S, n: SN<S>): S.S<S> {
  return N.run(node, n).scan((s, r) => r.r(s), s)
}

export const r = <S>(f: S => S): R<S> => new R(f)
