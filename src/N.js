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
export const r = <State>(f: State => State): R<State> => new R(f)

export class R<S> {
  r: S => S
  constructor(r: S => S) {
    this.r = r
  }
}

export type NPith<S> = (
  (N<S> | S.S<Patch | R<S>>) => void,
  { on: On.On, states: S.S<S>, ref: S.S<Node> }
) => void

export class N<S> {
  create: () => Node
  eq: Node => ?Node
  pith: S.S<NPith<S>>
  constructor(
    create: $PropertyType<N<S>, 'create'>,
    eq: $PropertyType<N<S>, 'eq'>,
    pith: $PropertyType<N<S>, 'pith'>
  ) {
    this.create = create
    this.eq = eq
    this.pith = pith
  }
  pmap<Sb>(f: (NPith<S>) => NPith<Sb>): N<Sb> {
    return new N(this.create, this.eq, this.pith.map(f))
  }
}

export function run<State>(
  node: HTMLElement,
  s: State,
  n: N<State>
): S.S<State> {
  var proxyO
  const states = S.s(o => ((proxyO = o), void 0)).multicast()
  const elm = n.eq(node) || node.insertBefore(n.create(), null)
  const patches: S.S<Patch | R<State>> = bark(states, n.pith)
  const rs = patches.filter2(x => (x instanceof Patch ? x.patch(elm) : x))
  return S.s(o =>
    o(
      rs
        .scan((s, r) => r.r(s), s)
        .run(e => {
          if (e instanceof S.Next)
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

export function bark<State>(
  states: S.S<State>,
  pith: $PropertyType<N<State>, 'pith'>
): S.S<Patch | R<State>> {
  const ring = pith =>
    M.bark(o => {
      const pnodes: Array<N<State>> = []
      var node: ?Node
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
            node = parent
          })
        )
      )
      const ref = S.s(os => {
        os(
          S.delay(function rec() {
            if (node) {
              os(S.next(node))
              os(S.delay(() => os(S.end)))
            } else os(S.delay(rec))
          })
        )
      })
      pith(
        v => {
          if (v instanceof S.S) o(v)
          else {
            const index = pnodes.length
            pnodes.push(v)
            o(
              bark(states, v.pith).map(p =>
                p instanceof Patch
                  ? patch(parent => p.patch(parent.childNodes[index]))
                  : p
              )
            )
          }
        },
        { on: new On.On(ref), ref, states }
      )
    })
  return pith.flatMap(ring)
}

export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export const node = <State>(
  create: $PropertyType<N<State>, 'create'>,
  eq: $PropertyType<N<State>, 'eq'>,
  pith: $PropertyType<N<State>, 'pith'>
): N<State> => new N<State>(create, eq, pith)

export const elm = <State>(
  tag: string,
  pith: SS<NPith<State>>,
  key?: ?string
): N<State> => {
  const TAG = tag.toUpperCase()
  return node(
    () => document.createElement(tag),
    n =>
      n instanceof HTMLElement &&
      n.nodeName === TAG &&
      (key == null || n.dataset.key === key)
        ? n
        : null,
    pith instanceof S.S ? pith : S.d(pith)
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
          os(S.next(node))
          os(S.delay(() => os(S.end)))
        } else os(S.delay(rec))
      })
    )
  })
  pith(o, { ...i, on: new On.On(ref), ref })
}

type SS<A> = S.S<A> | A

export const text = <State>(texts: SS<string>): N<State> =>
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
