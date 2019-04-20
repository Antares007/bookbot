// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import { cast } from '../cast'

type SS<A> = S.S<A> | A

export class NPith<T: Node> {
  pith: ({ o: (SS<Nodes>) => void, patch: (SS<(T) => void>) => void }) => void
  constructor(pith: $PropertyType<NPith<T>, 'pith'>) {
    this.pith = pith
  }
}

type Nodes = Div | Button | string

export class Div extends NPith<HTMLDivElement> {}
export class Button extends NPith<HTMLButtonElement> {}

export const div = (pith: $PropertyType<Div, 'pith'>): Div => new Div(pith)

export const button = (pith: $PropertyType<Button, 'pith'>): Button =>
  new Button(pith)

const ring = <N: Node>(
  p: (
    { o: (SS<Nodes>) => void, patch: (SS<(N => void) | boolean>) => void },
    number
  ) => void
): $PropertyType<NPith<N>, 'pith'> => {
  return o => {}
}

export function run<N: Node>(pith: NPith<N>): S.S<(N) => void> {
  return S.s(o => {
    const { start, stop } = makeStreamController(o)
    const nodes: Array<Nodes> = []
    const childPatches: Array<S.S<(N) => void>> = []
    const awaitingIds = []
    var i = 0
    pith.pith({
      o: ssnode => {
        const index = i++
        if (ssnode instanceof S.S) {
          nodes.push('empty')
          awaitingIds.push(index)
          start(node => {
            if (awaitingIds.length === 0) {
              nodes[index] = node.value
              update(index)
            } else {
              var pos = awaitingIds.indexOf(index)
              if (pos >= 0) awaitingIds.splice(pos, 1)
              nodes[index] = node.value
              if (awaitingIds.length === 0) init()
            }
          }, ssnode)
        } else nodes.push(ssnode)
      },
      patch: v => {}
    })
    if (awaitingIds.length === 0) o(S.delay(() => init()))

    function update(index) {
      const node = nodes[index]
      stop(childPatches[index])
      o(
        S.next(parent => {
          const on = parent.childNodes[index]
          if (eq(on, node)) return
          parent.insertBefore(create(node), on)
          parent.removeChild(on)
        })
      )
      start(o, (childPatches[index] = runAt(node, index)))
    }

    function init() {
      o(
        S.next(parent => {
          const pnodesLength = nodes.length
          const childNodes = parent.childNodes
          var li: ?Node
          for (var index = 0; index < pnodesLength; index++) {
            const x = nodes[index]
            li = null
            for (var i = index, l = childNodes.length; i < l; i++)
              if ((li = eq(childNodes[index], x))) break
            if (li == null) parent.insertBefore(create(x), childNodes[index])
            else if (i !== index) parent.insertBefore(li, childNodes[index])
          }
          for (var i = childNodes.length - 1; i >= pnodesLength; i--)
            parent.removeChild(childNodes[i])
        })
      )
      for (var i = 0, l = nodes.length; i < l; i++) {
        const patch = runAt(nodes[i], i)
        childPatches.push(patch)
        start(o, patch)
      }
    }
  })
}

function eq(n: Node, node: Nodes): ?Node {
  const TAG =
    typeof node === 'string' ? '#text' : node.constructor.name.toUpperCase()
  return n.nodeName === TAG ? n : null
}

function create(node: Nodes): Node {
  return typeof node === 'string'
    ? document.createTextNode(node)
    : document.createElement(node.constructor.name)
}

function mkMapper<T, N: Node>(
  index: number,
  klass: Class<T>
): ((T) => void) => N => void {
  return p => n => {
    const li = n.childNodes[index]
    if (li instanceof klass) p(li)
    else throw new Error('never')
  }
}

function runAt<N: Node>(node: Nodes, index: number): S.S<(N) => void> {
  if (typeof node === 'string') {
    return S.d(parent => {
      const on = parent.childNodes[index]
      if (on.nodeName === '#text') {
        if (on.textContent !== node) on.textContent === node
      } else throw new Error('never')
    })
  } else if (node instanceof Div) {
    return run(node).map(mkMapper(index, HTMLDivElement))
  } else {
    return run(node).map(mkMapper(index, HTMLButtonElement))
  }
}

function makeStreamController(o: (S.End | Error | D.Disposable) => void) {
  const dmap: Map<*, D.Disposable> = new Map()
  const start = <A>(f: (S.Next<A>) => void, $: S.S<A>): void => {
    dmap.set(
      $,
      S.run(e => {
        if (e instanceof S.Next) f(e)
        else if (e instanceof S.End) {
          dmap.delete($)
          if (dmap.size === 0) o(e)
        } else o(e)
      }, $)
    )
  }
  const stop = <A>($: S.S<A>): void => {
    const d = dmap.get($)
    if (d) {
      dmap.delete($)
      d.dispose()
      if (dmap.size === 0) o(S.end)
    }
  }
  o(
    D.create(() => {
      for (var d of dmap.values()) d.dispose()
    })
  )
  return {
    start,
    stop
  }
}
