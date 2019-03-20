// @flow strict
import * as S from './stream'
import * as SPith from './SPith'
import * as D from './disposable'
import * as M from './m'
import * as On from './on'

export class Patch {
  patch: Node => void
  constructor(patch: $PropertyType<Patch, 'patch'>) {
    this.patch = patch
  }
}

type SS<A> = S.S<A> | A

export class N<A, B, O> extends SPith.T<
  void,
  void,
  N<A, B, O> | S.S<Patch | O>
> {
  create: () => Node
  eq: Node => ?Node
  constructor(
    create: $PropertyType<N<A, B, O>, 'create'>,
    eq: $PropertyType<N<A, B, O>, 'eq'>,
    pith: $PropertyType<N<A, B, O>, 'pith'>
  ) {
    super(pith)
    this.create = create
    this.eq = eq
  }
}

export function run<O>(node: HTMLElement, n: N<void, void, O>): S.S<O> {
  const elm = n.eq(node) || node.insertBefore(n.create(), null)
  const patches: S.S<Patch | O> = bark(n.pith)
  return patches.filter2(x => (x instanceof Patch ? x.patch(elm) : x))
}

export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export const node = <A, B, O>(
  create: $PropertyType<N<A, B, O>, 'create'>,
  eq: $PropertyType<N<A, B, O>, 'eq'>,
  pith: $PropertyType<N<A, B, O>, 'pith'>
): N<A, B, O> => new N<A, B, O>(create, eq, pith)

export const elm = <A, B, O>(
  tag: string,
  pith: $PropertyType<N<A, B, O>, 'pith'>,
  key?: ?string
): N<A, B, O> => {
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

export const onelm = <A, B, O>(
  tag: string,
  pith: On.On => $PropertyType<N<A, B, O>, 'pith'>,
  key?: ?string
): N<A, B, O> => {
  const ring = pith => o => {
    var thisN: Node
    const p = patch(n => {
      thisN = n
    })
    o(
      S.s(o =>
        o(
          S.delay(() => {
            o(S.event(p))
            o(S.delay(() => o(S.end)))
          })
        )
      )
    )
    const on = new On.On(
      S.s(o =>
        o(
          S.delay(() => {
            o(S.event(thisN))
            o(S.delay(() => o(S.end)))
          })
        )
      )
    )
    const p0 = pith(on)
  }
  return elm(
    tag,
    pith instanceof S.S ? pith.flatMapLatest(ring) : ring(pith),
    key
  )
}
export const text = <A, B, O>(texts: SS<string>): N<A, B, O> =>
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

export function bark<A, B, O>(
  pith: $PropertyType<N<A, B, O>, 'pith'>
): S.S<Patch | O> {
  const ring = pith =>
    M.bark(o => {
      const pnodes: Array<N<A, B, O>> = []
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
