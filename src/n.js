// @flow strict
import * as S from './stream'
import * as D from './disposable'
import * as M from './m'

export class Patch {
  patch: Node => void
  constructor(patch: $PropertyType<Patch, 'patch'>) {
    this.patch = patch
  }
}

type SS<A> = S.S<A> | A

export class N<A> {
  create: () => Node
  eq: Node => ?Node
  pith: SS<((N<A> | S.S<Patch | A>) => void) => void>

  constructor(
    create: $PropertyType<N<A>, 'create'>,
    eq: $PropertyType<N<A>, 'eq'>,
    pith: $PropertyType<N<A>, 'pith'>
  ) {
    this.create = create
    this.eq = eq
    this.pith = pith
  }
}

export function run<A>(node: HTMLElement, n: N<A>): S.S<A> {
  const elm = n.eq(node) || node.insertBefore(n.create(), null)
  const patches: S.S<Patch | A> = bark(n.pith)
  return patches.filter2(x => (x instanceof Patch ? x.patch(elm) : x))
}

export function bark<A>(pith: $PropertyType<N<A>, 'pith'>): S.S<Patch | A> {
  const ring = pith =>
    M.bark(o => {
      const pnodes: Array<N<A>> = []
      o(
        S.at(
          patch(parent => {
            const pnodesLength = pnodes.length
            const childNodes = parent.childNodes
            for (var index = 0; index < pnodesLength; index++) {
              const n = pnodes[index]
              var li: ?Node
              for (var i = index, l = childNodes.length; i < l; i++)
                if ((li = n.eq(parent.childNodes[i]))) break
              if (li == null) parent.insertBefore(n.create(), childNodes[index])
              else if (i !== index) parent.insertBefore(li, childNodes[index])
            }
            for (var i = childNodes.length - 1; i >= pnodesLength; i--)
              parent.removeChild(childNodes[i])
          })
        )
      )
      pith(v => {
        if (v instanceof S.S) o(v)
        else {
          const index = pnodes.length
          pnodes.push(v)
          const patches =
            v.pith instanceof S.S ? v.pith.flatMapLatest(ring) : ring(v.pith)
          o(
            patches.map(p =>
              p instanceof Patch
                ? patch(parent => p.patch(parent.childNodes[index]))
                : p
            )
          )
        }
      })
    })
  return pith instanceof S.S ? pith.flatMapLatest(ring) : ring(pith)
}

export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export const node = <A>(
  create: $PropertyType<N<A>, 'create'>,
  eq: $PropertyType<N<A>, 'eq'>,
  pith: $PropertyType<N<A>, 'pith'>
): N<A> => new N<A>(create, eq, pith)

export const elm = <A>(
  tag: string,
  pith: $PropertyType<N<A>, 'pith'>,
  key?: ?string
): N<A> => {
  const TAG = tag.toUpperCase()
  return node(
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

export const text = <A>(texts: SS<string>): N<A> =>
  node(
    () => document.createTextNode(''),
    n => (n instanceof Text ? n : null),
    o =>
      o(
        (texts instanceof S.S ? texts : S.at(texts)).map(text =>
          patch(n => {
            n.textContent = text
          })
        )
      )
  )
