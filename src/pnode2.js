// @flow strict
import * as S from './stream2'

export type PNode$patch = { t: 'PNode$patch', patch: Node => void }
export const patch = (
  patch: $PropertyType<PNode$patch, 'patch'>
): PNode$patch => ({
  t: 'PNode$patch',
  patch
})

export type PNode$pith = {
  t: 'PNode$pith',
  pith: ((PNode$node | S.S<PNode$patch>) => void) => void
}
export const pith = (pith: $PropertyType<PNode$pith, 'pith'>): PNode$pith => ({
  t: 'PNode$pith',
  pith
})

export type PNode$node = {
  t: 'PNode$node',
  create: () => Node,
  eq: Node => boolean,
  spith: S.S<PNode$pith>
}
export const node = (
  create: $PropertyType<PNode$node, 'create'>,
  eq: $PropertyType<PNode$node, 'eq'>,
  spith: $PropertyType<PNode$node, 'spith'>
): PNode$node => ({
  t: 'PNode$node',
  create,
  eq,
  spith
})

export function run(spith: S.S<PNode$pith>): S.S<(Node) => void> {
  return S.switchLatest(
    spith.map(x => {
      var pnodesCount = 0
      var p = S.empty()
      var pnodes: Array<[number, () => Node, (Node) => boolean]> = []
      x.pith(x => {
        if (x instanceof S.S) {
          p = p.merge(x.map(p => p.patch))
        } else {
          const index = pnodesCount++
          pnodes.push([index, x.create, x.eq])
          p = p.merge(
            S.map(p => parent => p(parent.childNodes[index]), run(x.spith))
          )
        }
      })
      if (pnodesCount === 0) return p
      return p.startWith((parent: Node) => {
        const childNodes = parent.childNodes
        const misplacedPnodes: Array<[Node, Node]> = []
        for (var i = 0; i < childNodes.length && pnodes.length > 0; i++) {
          const li = childNodes[i]
          for (var j = 0; j < pnodes.length; j++) {
            const pi = pnodes[j]
            if (pi[2](li)) {
              pnodes.splice(j, 1)
              if (pi[0] !== i) misplacedPnodes.push([li, childNodes[pi[0]]])
              break
            }
          }
        }
        for (var pm of misplacedPnodes) parent.replaceChild(pm[0], pm[1])
        for (var pn of pnodes) {
          const oldNode = childNodes[pn[0]]
          if (oldNode) parent.replaceChild(pn[1](), oldNode)
          else parent.insertBefore(pn[1](), null)
        }
        for (var i = childNodes.length - 1; i >= pnodesCount; i--)
          parent.removeChild(childNodes[i])
      })
    })
  )
}
