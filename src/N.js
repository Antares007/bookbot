// @flow
import * as S from './S'
import * as M from './M'
import * as On from './S/On'

export type NPith<S> = (
  (N<S> | S.S<Patch | R<S>>) => void,
  { on: On.On, states: S.S<S>, ref: S.S<Node> }
) => void

export class Patch {
  patch: Node => void
  constructor(patch: $PropertyType<Patch, 'patch'>) {
    this.patch = patch
  }
}

export class R<S> {
  r: S => S
  constructor(r: S => S) {
    this.r = r
  }
}

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
            var li: ?Node
            for (var index = 0; index < pnodesLength; index++) {
              const n = pnodes[index]
              li = null
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
            } else throw new Error('never')
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
  return pith.flatMapLatest(ring)
}

type SS<A> = S.S<A> | A

export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export const r = <State>(f: State => State): R<State> => new R(f)

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
    () => {
      const elm = document.createElement(tag)
      if (key) elm.dataset.key = key
      return elm
    },
    n =>
      n instanceof HTMLElement &&
      n.nodeName === TAG &&
      (key == null || n.dataset.key === key)
        ? n
        : null,
    pith instanceof S.S ? pith : S.d(pith)
  )
}

export const text = <State>(texts: SS<string>): N<State> =>
  node(
    () => document.createTextNode(''),
    n => (n instanceof Text ? n : null),
    S.d(o =>
      o(
        (texts instanceof S.S ? texts : S.d(texts)).map(text =>
          patch(n => {
            if (n.textContent !== text) n.textContent = text
          })
        )
      )
    )
  )

export function select<A: any, B: any>(key: string): (R<B>) => R<A> {
  return function(rb) {
    return r((a: A) => ({ ...a, [key]: rb.r(a[key]) }))
  }
}

export function ringState<A: any, B: any>(
  key: string,
  b: B
): (NPith<B>) => NPith<A> {
  return function map(pith) {
    return (o, i) =>
      pith(
        v => {
          if (v instanceof S.S)
            o(
              v.map(x =>
                x instanceof R
                  ? r((a: A) => ({ ...a, [key]: x.r(a[key] || b) }))
                  : x
              )
            )
          else o(v.pmap(map))
        },
        {
          ...i,
          states: i.states.map(s => {
            if (typeof s[key] === 'object') return s[key]
            return b
          })
        }
      )
  }
}
