// @flow strict
import * as S from './stream'
import * as D from './disposable'
import * as N from './n'

export class R<S> {}

export class SN<S> extends N.N<R<S>> {
  constructor(
    create: $PropertyType<SN<S>, 'create'>,
    eq: $PropertyType<SN<S>, 'eq'>,
    pith: $PropertyType<SN<S>, 'pith'>
  ) {
    super(create, eq, pith)
  }
}

export const elm = <A>(
  tag: string,
  pith: $PropertyType<SN<A>, 'pith'>,
  key?: ?string
): SN<A> => {
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

export function run<A>(node: HTMLElement, n: SN<A>): S.S<R<A>> {
  return N.run(node, n)
}
