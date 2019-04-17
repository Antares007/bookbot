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
    const dmap: Map<S.S<Nodes>, D.Disposable> = new Map()

    o(
      D.create(() => {
        for (var d of dmap.values()) d.dispose()
      })
    )

    const nodess: Array<SS<Nodes>> = []

    pith.pith({
      o: v => (nodess.push(v), void 0),
      patch: v => {}
    })

    const mnodes: Array<?Nodes> = []

    for (var i = 0, l = nodess.length; i < l; i++) {
      const n = nodess[i]
      if (n instanceof S.S) {
        dmap.set(
          n,
          S.run(e => {
            if (e instanceof S.Next) {
              if (nodes) {
                nodes[i] = e.value
              } else {
                mnodes[i] = e.value
                if (!mnodes.some(n => n === null))
                  nodes = cast(mnodes)<Array<Nodes>>()
                o(initPatch)
              }
            } else if (e instanceof S.End) {
              dmap.delete(n)
              if (dmap.size === 0) o(e)
            } else o(e)
          }, n)
        )
        mnodes.push(null)
      } else mnodes.push(n)
    }

    var nodes: Array<Nodes>

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
