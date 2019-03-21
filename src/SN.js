// @flow strict
import * as S from './S'
import * as D from './Disposable'
import * as N from './N'

export class R<S> {
  r: S => S
  constructor(r: S => S) {
    this.r = r
  }
}

export class T<S> extends N.T<void, void, R<S>> {
  constructor(
    create: $PropertyType<T<S>, 'create'>,
    eq: $PropertyType<T<S>, 'eq'>,
    pith: $PropertyType<T<S>, 'pith'>
  ) {
    super(create, eq, pith)
  }
}

export const elm = <S>(
  tag: string,
  pith: $PropertyType<T<S>, 'pith'>,
  key?: ?string
): T<S> => {
  const TAG = tag.toUpperCase()
  return new T(
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

export function run<S>(node: HTMLElement, s: S, n: T<S>): S.T<S> {
  return N.run(node, n).scan((s, r) => r.r(s), s)
}

export const r = <S>(f: S => S): R<S> => new R(f)
