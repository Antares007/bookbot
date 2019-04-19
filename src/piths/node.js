// @flow
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

const see = div(
  ring(({ o, patch }, i) => {
    patch(a => {})
    patch(true)
    o(
      button(
        ring(({ o, patch }, i) => {
          patch(n => {})
        })
      )
    )
    o(div(({ o, patch }, i) => {}))
  })
)

const counter = (d: number) =>
  div(({ o }) => {
    o(
      button(({ o }) => {
        o('+')
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      button(({ o }) => {
        o('-')
        d > 0 && o(counter(d - 1))
      })
    )
    o('0')
  })

function run<N: Node>(pith: NPith<N>): S.S<(N) => void> {
  return S.s(o => {
    const { start, stop } = makeStreamController(o)
    const nodes: Array<string | [Div | Button, S.S<(N) => void>]> = []
    const awaitingIds = []
    const mkMapper = <T>(
      index: number,
      klass: Class<T>
    ): (((T) => void) => N => void) => {
      return p => (n: N) => {
        const li = n.childNodes[index]
        if (li instanceof klass) p(li)
        else throw new Error('never')
      }
    }
    const mkNode = (
      node: Nodes,
      index: number
    ): string | [Div | Button, S.S<(N) => void>] => {
      if (typeof node === 'string') {
        return node
      } else if (node instanceof Div) {
        return [node, run(node).map(mkMapper(index, HTMLDivElement))]
      } else {
        return [node, run(node).map(mkMapper(index, HTMLButtonElement))]
      }
    }
    var i = 0
    pith.pith({
      o: ssnode => {
        const index = i++
        if (ssnode instanceof S.S) {
          nodes.push('')
          start(node => {
            if (awaitingIds.length === 0) {
              update(mkNode(node, index), index)
            } else {
              var pos = awaitingIds.indexOf(index)
              if (pos >= 0) awaitingIds.splice(pos, 1)
              nodes[index] = mkNode(node, index)
              if (awaitingIds.length === 0) init()
            }
          }, ssnode)
        } else nodes.push(mkNode(ssnode, index))
      },
      patch: v => {}
    })
    if (awaitingIds.length === 0) init()

    function update(node, index) {
      const oldNode = nodes[index]
      if (typeof node === 'string')
        if (typeof oldNode === 'string') {
          if (oldNode !== node)
            o(
              S.next(parent => {
                parent.childNodes[index].textContent = node
              })
            )
        } else
          o(
            S.next(parent => {
              const on = parent.childNodes[index]
              parent.insertBefore(document.createTextNode(node), on)
              parent.removeChild(on)
            })
          )
      else {
        if (
          typeof oldNode !== 'string' &&
          oldNode[0].constructor === node[0].constructor
        ) {
          stop(oldNode[1])
        } else {
          if (typeof oldNode !== 'string') stop(oldNode[1])
          o(
            S.next(parent => {
              const on = parent.childNodes[index]
              parent.insertBefore(
                document.createTextNode(node[0].constructor.name),
                on
              )
              parent.removeChild(on)
            })
          )
        }
        start(p => o(S.next(p)), node[1])
      }
      nodes[index] = node
    }

    function init() {
      o(
        S.next(parent => {
          const pnodesLength = nodes.length
          const childNodes = parent.childNodes
          var li: ?Node
          for (var index = 0; index < pnodesLength; index++) {
            const x = nodes[index]
            const TAG =
              typeof x === 'string'
                ? '#text'
                : x[0].constructor.name.toUpperCase()
            li = null
            for (var i = index, l = childNodes.length; i < l; i++)
              if (childNodes[i].nodeName === TAG) {
                li = childNodes[i]
                break
              }
            if (li == null) {
              li =
                typeof x === 'string'
                  ? document.createTextNode(x)
                  : document.createElement(TAG)
              parent.insertBefore(li, childNodes[index])
            } else if (i !== index) parent.insertBefore(li, childNodes[index])
          }
          for (var i = childNodes.length - 1; i >= pnodesLength; i--)
            parent.removeChild(childNodes[i])
        })
      )
      for (var i = 0, l = nodes.length; i < l; i++) {
        const n = nodes[i]
        if (typeof n === 'string') continue
        start(p => o(S.next(p)), n[1])
      }
    }
  })
}

var patches = run(counter(3))
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
const elm = document.createElement('div')
rootNode.appendChild(elm)

patches.map(p => p(elm)).run(console.log.bind(console))

function makeStreamController(o) {
  const dmap: Map<*, D.Disposable> = new Map()
  const start = <A>(f: A => void, $: S.S<A>): void => {
    dmap.set(
      $,
      S.run(e => {
        if (e instanceof S.Next) f(e.value)
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
    } else throw new Error('never')
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
