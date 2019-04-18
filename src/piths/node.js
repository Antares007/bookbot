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
    const mnodes: Array<?Nodes> = []
    const mnodeIdxs = []
    var mi = 0
    const hasAllNodes = () => {
      for (; mi < mnodeIdxs.length; mi++)
        if (mnodes[mnodeIdxs[mi]] === null) return false
      return true
    }
    var nodes: Array<Nodes>
    var i = 0

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
    pith.pith({
      o: ssnode => {
        const index = i++
        if (ssnode instanceof S.S) {
          mnodes.push(null)
          mnodeIdxs.push(index)
          start(node => {
            if (nodes) {
              update(node, index)
            } else {
              mnodes[index] = node
            }
          }, ssnode)
        } else {
          mnodes.push(ssnode)
          if (ssnode instanceof Div) {
            let see = run(ssnode).map(mkMapper(index, HTMLDivElement))
          }
        }
      },
      patch: v => {}
    })

    function init() {}
    function update(node, index) {}

    const initPatch = S.next(parent => {
      const pnodesLength = nodes.length
      const childNodes = parent.childNodes
      var li: ?Node
      for (var index = 0; index < pnodesLength; index++) {
        const n = nodes[index]
        const TAG =
          typeof n === 'string' ? '#text' : n.constructor.name.toUpperCase()
        li = null
        for (var i = index, l = childNodes.length; i < l; i++)
          if (childNodes[i].nodeName === TAG) {
            li = childNodes[i]
            break
          }
        if (li == null) {
          li =
            typeof n === 'string'
              ? document.createTextNode(n)
              : document.createElement(TAG)
          parent.insertBefore(li, childNodes[index])
        } else if (i !== index) parent.insertBefore(li, childNodes[index])
      }
      for (var i = childNodes.length - 1; i >= pnodesLength; i--)
        parent.removeChild(childNodes[i])
    })
  })
}

run(counter(3))

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
