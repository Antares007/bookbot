// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import { cast } from '../cast'

type SS<A> = S.S<A> | A

export class N<T: Node> {
  pith: ({
    o: (
      SS<
        N<HTMLButtonElement> | N<HTMLDivElement> | N<HTMLAnchorElement> | string
      >
    ) => void,
    patch: (SS<(T) => void>) => void
  }) => void
  constructor(pith: $PropertyType<N<T>, 'pith'>) {
    this.pith = pith
  }
}

declare var elm: {
  ('div', $PropertyType<N<HTMLDivElement>, 'pith'>): N<HTMLDivElement>,
  ('button', $PropertyType<N<HTMLButtonElement>, 'pith'>): N<HTMLButtonElement>,
  ('a', $PropertyType<N<HTMLAnchorElement>, 'pith'>): N<HTMLAnchorElement>,
  (
    'h1' | 'h2' | 'h3' | 'h4',
    $PropertyType<N<HTMLHeadingElement>, 'pith'>
  ): N<HTMLHeadingElement>
  //(string, $PropertyType<N<HTMLElement>, 'pith'>): N<HTMLElement>
}

export const div = (
  pith: $PropertyType<N<HTMLDivElement>, 'pith'>
): N<HTMLDivElement> => new N(pith)
export const button = (
  pith: $PropertyType<N<HTMLButtonElement>, 'pith'>
): N<HTMLButtonElement> => new N(pith)

elm('div', ({ o, patch }) => {
  o(
    button(({ o, patch }) => {
      patch(n => {})
    })
  )
})
//type Nodes = Div | Button | string
//
//export class Div extends NPith<HTMLDivElement> {}
//export class Button extends NPith<HTMLButtonElement> {}
//
//export const div = (pith: $PropertyType<Div, 'pith'>): Div => new Div(pith)
//
//export const button = (pith: $PropertyType<Button, 'pith'>): Button =>
//  new Button(pith)
//
//const ring = <N: Node>(
//  p: (
//    { o: (SS<Nodes>) => void, patch: (SS<(N => void) | boolean>) => void },
//    number
//  ) => void
//): $PropertyType<NPith<N>, 'pith'> => {
//  return o => {}
//}
//
//export function run<N: Node>(pith: NPith<N>): S.S<(N) => void> {
//  return S.s(o => {
//    const { start, stop } = makeStreamController(o)
//    const ssnodes: Array<SS<Nodes>> = []
//    var childPatches: Array<S.S<(N) => void>>
//    var nodes: Array<Nodes>
//    pith.pith({
//      o: ssnode => {
//        ssnodes.push(ssnode)
//      },
//      patch: v => {}
//    })
//    start(e => {
//      const v = e.value
//      if (v.type === 'init') {
//        nodes = v.v
//        childPatches = nodes.map((n, i) => runAt(n, i))
//        childPatches.forEach(p => start(o, p))
//        o(
//          S.next(parent => {
//            const pnodesLength = nodes.length
//            const childNodes = parent.childNodes
//            var li: ?Node
//            for (var index = 0; index < pnodesLength; index++) {
//              const x = nodes[index]
//              li = null
//              for (var i = index, l = childNodes.length; i < l; i++)
//                if ((li = eq(childNodes[index], x))) break
//              if (li == null) parent.insertBefore(create(x), childNodes[index])
//              else if (i !== index) parent.insertBefore(li, childNodes[index])
//            }
//            for (var i = childNodes.length - 1; i >= pnodesLength; i--)
//              parent.removeChild(childNodes[i])
//          })
//        )
//      } else {
//        const { index, v: node } = v
//        const oldNode = nodes[index]
//        nodes[index] = node
//        const patch = runAt(node, index)
//        const oldPatch = childPatches[index]
//        childPatches[index] = patch
//        start(o, patch)
//        stop(oldPatch)
//        if (oldNode.constructor !== node.constructor)
//          o(
//            S.next(parent => {
//              const on = parent.childNodes[index]
//              if (eq(on, node)) return
//              parent.insertBefore(create(node), on)
//              parent.removeChild(on)
//            })
//          )
//      }
//    }, combineSS(ssnodes))
//  })
//}
//
//function eq(n: Node, node: Nodes): ?Node {
//  const TAG =
//    typeof node === 'string' ? '#text' : node.constructor.name.toUpperCase()
//  return n.nodeName === TAG ? n : null
//}
//
//function create(node: Nodes): Node {
//  return typeof node === 'string'
//    ? document.createTextNode(node)
//    : document.createElement(node.constructor.name)
//}
//
//function mkMapper<T, N: Node>(
//  index: number,
//  klass: Class<T>
//): ((T) => void) => N => void {
//  return p => n => {
//    const li = n.childNodes[index]
//    if (li instanceof klass) p(li)
//    else throw new Error('never')
//  }
//}
//
//function runAt<N: Node>(node: Nodes, index: number): S.S<(N) => void> {
//  if (typeof node === 'string') {
//    return S.d(parent => {
//      const on = parent.childNodes[index]
//      if (on.nodeName === '#text') {
//        if (on.textContent !== node) on.textContent === node
//      } else throw new Error('never')
//    })
//  } else if (node instanceof Div) {
//    return run(node).map(mkMapper(index, HTMLDivElement))
//  } else {
//    return run(node).map(mkMapper(index, HTMLButtonElement))
//  }
//}
//
//function combineSS<A>(
//  array: Array<SS<A>>
//): S.S<
//  { type: 'init', v: Array<A> } | { type: 'update', v: A, index: number }
//> {
//  return S.s(o => {
//    const dmap = new Map()
//    const as: Array<A> = new Array(array.length)
//    const idxs = []
//    o(
//      D.create(() => {
//        for (var d of dmap.values()) d.dispose()
//      })
//    )
//    for (let index = 0, l = array.length; index < l; index++) {
//      const a = array[index]
//      if (a instanceof S.S) {
//        idxs.push(index)
//        dmap.set(
//          index,
//          S.run(e => {
//            if (e instanceof S.Next) {
//              if (idxs.length === 0)
//                o(S.next({ type: 'update', v: e.value, index }))
//              else {
//                as[index] = e.value
//                const pos = idxs.indexOf(index)
//                if (pos !== -1) idxs.splice(pos, 1)
//                if (idxs.length === 0) o(S.next({ type: 'init', v: as }))
//              }
//            } else if (e instanceof S.End) {
//              dmap.delete(index)
//              if (dmap.size === 0) o(e)
//            } else o(e)
//          }, a)
//        )
//      } else as[index] = a
//    }
//    if (idxs.length === 0) {
//      o(
//        S.delay(() => {
//          o(S.next({ type: 'init', v: as }))
//          o(S.delay(() => o(S.end)))
//        })
//      )
//    }
//  })
//}
//
//function makeStreamController(o: (S.End | Error | D.Disposable) => void) {
//  const dmap: Map<*, D.Disposable> = new Map()
//  const start = <A>(f: (S.Next<A>) => void, $: S.S<A>): void => {
//    dmap.set(
//      $,
//      S.run(e => {
//        if (e instanceof S.Next) f(e)
//        else if (e instanceof S.End) {
//          dmap.delete($)
//          if (dmap.size === 0) o(e)
//        } else o(e)
//      }, $)
//    )
//  }
//  const stop = <A>($: S.S<A>): void => {
//    const d = dmap.get($)
//    if (d) {
//      dmap.delete($)
//      d.dispose()
//      if (dmap.size === 0) o(S.end)
//    }
//  }
//  o(
//    D.create(() => {
//      for (var d of dmap.values()) d.dispose()
//    })
//  )
//  return {
//    start,
//    stop
//  }
//}
