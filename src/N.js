// @flow strict
import * as S from './S'
import * as M from './M'
import * as On from './S/On'

export class Patch {
  patch: Node => void
  constructor(patch: $PropertyType<Patch, 'patch'>) {
    this.patch = patch
  }
}

export type NPith<I, O> = ((N<I, O> | S.S<Patch | O>) => void, I) => void

export class N<I, O> {
  create: () => Node
  eq: Node => ?Node
  pith: S.S<NPith<I, O>>
  constructor(
    create: $PropertyType<N<I, O>, 'create'>,
    eq: $PropertyType<N<I, O>, 'eq'>,
    pith: $PropertyType<N<I, O>, 'pith'>
  ) {
    this.create = create
    this.eq = eq
    this.pith = pith
  }
  pmap<Io, Oo>(f: (NPith<I, O>) => NPith<Io, Oo>): N<Io, Oo> {
    return new N(this.create, this.eq, this.pith.map(f))
  }
}

export function run<O>(node: HTMLElement, n: N<void, O>): S.S<O> {
  const elm = n.eq(node) || node.insertBefore(n.create(), null)
  const patches: S.S<Patch | O> = bark(n.pith)
  return patches.filter2(x => (x instanceof Patch ? x.patch(elm) : x))
}

export function bark<O>(
  pith: $PropertyType<N<void, O>, 'pith'>
): S.S<Patch | O> {
  const ring = pith =>
    M.bark(o => {
      const pnodes: Array<N<void, O>> = []
      o(
        S.d(
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
          o(
            bark(v.pith).map(p =>
              p instanceof Patch
                ? patch(parent => p.patch(parent.childNodes[index]))
                : p
            )
          )
        }
      })
    })
  return pith.flatMap(ring)
}

export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export const node = <I, O>(
  create: $PropertyType<N<I, O>, 'create'>,
  eq: $PropertyType<N<I, O>, 'eq'>,
  pith: $PropertyType<N<I, O>, 'pith'>
): N<I, O> => new N<I, O>(create, eq, pith)

export const elm = <I, O>(
  tag: string,
  pith: $PropertyType<N<I, O>, 'pith'>,
  key?: ?string
): N<I, O> => {
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

export const ringOn = <I, N, O>(
  pith: (
    (N | S.S<Patch | O>) => void,
    { i: I, on: On.On, ref: S.S<Node> }
  ) => void
): (((N | S.S<Patch | O>) => void, I) => void) => (o, i) => {
  var node: ?Node
  o(S.d(patch(n => ((node = n), void 0))))
  const ref = S.s(os => {
    os(
      S.delay(function rec() {
        if (node) {
          os(S.event(node))
          os(S.delay(() => os(S.end)))
        } else os(S.delay(rec))
      })
    )
  })
  pith(o, { ...i, on: new On.On(ref), ref })
}

type SS<A> = S.S<A> | A

export const text = <I, O>(texts: SS<string>): N<I, O> =>
  node(
    () => document.createTextNode(''),
    n => (n instanceof Text ? n : null),
    S.d(o =>
      o(
        (texts instanceof S.S ? texts : S.d(texts)).map(text =>
          patch(n => {
            n.textContent = text
          })
        )
      )
    )
  )
