// @flow strict
import * as S from './S'
import * as SPith from './SPith'
import * as M from './M'
import * as On from './S/On'

export class Patch {
  patch: Node => void
  constructor(patch: $PropertyType<Patch, 'patch'>) {
    this.patch = patch
  }
}

type SS<A> = S.T<A> | A

export class T<A, O> extends SPith.T<void, void, T<A, O> | S.T<Patch | O>> {
  create: () => Node
  eq: Node => ?Node
  constructor(
    create: $PropertyType<T<A, O>, 'create'>,
    eq: $PropertyType<T<A, O>, 'eq'>,
    pith: $PropertyType<T<A, O>, 'pith'>
  ) {
    super(pith)
    this.create = create
    this.eq = eq
  }
}

export function run<O>(node: HTMLElement, n: T<void, O>): S.T<O> {
  const elm = n.eq(node) || node.insertBefore(n.create(), null)
  const patches: S.T<Patch | O> = bark(n.pith)
  return patches.filter2(x => (x instanceof Patch ? x.patch(elm) : x))
}

export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export const node = <A, O>(
  create: $PropertyType<T<A, O>, 'create'>,
  eq: $PropertyType<T<A, O>, 'eq'>,
  pith: $PropertyType<T<A, O>, 'pith'>
): T<A, O> => new T<A, O>(create, eq, pith)

export const elm = <A, O>(
  tag: string,
  pith: $PropertyType<T<A, O>, 'pith'>,
  key?: ?string
): T<A, O> => {
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

export const ringOn = <A, B>(
  pith: ((A | S.T<Patch | B>) => void, { on: On.T, ref: S.T<Node> }) => void
): (((A | S.T<Patch | B>) => void) => void) => o => {
  var node: ?Node
  o(S.at(patch(n => ((node = n), void 0))))
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
  pith(o, { on: new On.T(ref), ref })
}

export const text = <A, O>(texts: SS<string>): T<A, O> =>
  node(
    () => document.createTextNode(''),
    n => (n instanceof Text ? n : null),
    o =>
      o(
        (texts instanceof S.T ? texts : S.at(texts)).map(text =>
          patch(n => {
            n.textContent = text
          })
        )
      )
  )

export function bark<O>(
  pith: $PropertyType<T<void, O>, 'pith'>
): S.T<Patch | O> {
  const ring = pith =>
    M.bark(o => {
      const pnodes: Array<T<void, O>> = []
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
        if (v instanceof S.T) o(v)
        else {
          const index = pnodes.length
          pnodes.push(v)
          const patches =
            v.pith instanceof S.T ? v.pith.flatMapLatest(ring) : ring(v.pith)
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
  return pith instanceof S.T ? pith.flatMapLatest(ring) : ring(pith)
}
