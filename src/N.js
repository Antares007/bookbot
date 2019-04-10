// @flow strict
import * as S from './S'
import * as M from './M'

export type NPith<I, O> = ((N<I, O> | S.S<Patch | O>) => void, I) => void

export class Patch {
  patch: Node => void
  constructor(patch: $PropertyType<Patch, 'patch'>) {
    this.patch = patch
  }
}
export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export class N<I, O> {
  create: () => Node
  eq: Node => ?Node
  pith: S.S<NPith<I, O>>
  constructor(create: () => Node, eq: Node => ?Node, pith: S.S<NPith<I, O>>) {
    this.create = create
    this.eq = eq
    this.pith = pith
  }
  pmap<Ib, Ob>(f: (NPith<I, O>) => NPith<Ib, Ob>): N<Ib, Ob> {
    return new N(this.create, this.eq, this.pith.map(f))
  }
}
export const node = <I, O>(
  create: () => Node,
  eq: Node => ?Node,
  pith: S.S<NPith<I, O>>
): N<I, O> => new N(create, eq, pith)

export function run<I, O>(node: HTMLElement, i: I, n: N<I, O>): S.S<O> {
  const elm = n.eq(node) || node.insertBefore(n.create(), null)
  return bark(i, n.pith).filter2(x => (x instanceof Patch ? x.patch(elm) : x))
}

export function bark<I, O>(i: I, pith: S.S<NPith<I, O>>): S.S<Patch | O> {
  const ring = pith =>
    M.bark(o => {
      const pnodes: Array<N<I, O>> = []
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
                if ((li = n.eq(childNodes[i]))) break
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
            bark(i, v.pith).map(p =>
              p instanceof Patch
                ? patch(parent => p.patch(parent.childNodes[index]))
                : p
            )
          )
        }
      }, i)
    })
  return pith.flatMapLatest(ring)
}

//
//export const elm = <State>(
//  tag: string,
//  pith: SS<NPith<State>>,
//  key?: ?string
//): N<State> => {
//  const TAG = tag.toUpperCase()
//  return node(
//    () => {
//      const elm = document.createElement(tag)
//      if (key) elm.dataset.key = key
//      return elm
//    },
//    n =>
//      n instanceof HTMLElement &&
//      n.nodeName === TAG &&
//      (key == null || n.dataset.key === key)
//        ? n
//        : null,
//    pith instanceof S.S ? pith : S.d(pith)
//  )
//}
//
//export const text = <State>(texts: SS<string>): N<State> =>
//  node(
//    () => document.createTextNode(''),
//    n => (n instanceof Text ? n : null),
//    S.d(o =>
//      o(
//        (texts instanceof S.S ? texts : S.d(texts)).map(text =>
//          patch(n => {
//            if (n.textContent !== text) n.textContent = text
//          })
//        )
//      )
//    )
//  )
//
//export function select<A: any, B: any>(key: string): (R<B>) => R<A> {
//  return function(rb) {
//    return r((a: A) => ({ ...a, [key]: rb.r(a[key]) }))
//  }
//}
//
//export function ringState<A: any, B: any>(
//  key: string,
//  b: B
//): (NPith<B>) => NPith<A> {
//  return function map(pith) {
//    return (o, i) =>
//      pith(
//        v => {
//          if (v instanceof S.S)
//            o(
//              v.map(x =>
//                x instanceof R
//                  ? r((a: A) => ({ ...a, [key]: x.r(a[key] || b) }))
//                  : x
//              )
//            )
//          else o(v.pmap(map))
//        },
//        {
//          ...i,
//          states: i.states.map(s => {
//            if (typeof s[key] === 'object') return s[key]
//            return b
//          })
//        }
//      )
//  }
//}
