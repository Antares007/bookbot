// @flow strict
import * as S from './stream'
import * as D from './disposable'
import * as M from './m'

type N$Pith = ((NodeT | S.S<PatchT>) => void) => void

export class PatchT {
  v: Node => void
  constructor(v: $PropertyType<PatchT, 'v'>) {
    this.v = v
  }
}

export class NodeT {
  create: () => Node
  eq: Node => boolean
  patches: S.S<PatchT>
  constructor(
    create: $PropertyType<NodeT, 'create'>,
    eq: $PropertyType<NodeT, 'eq'>,
    patches: $PropertyType<NodeT, 'patches'>
  ) {
    this.create = create
    this.eq = eq
    this.patches = patches
  }
}

export const patch = (v: $PropertyType<PatchT, 'v'>): PatchT => new PatchT(v)

export const node = (
  create: $PropertyType<NodeT, 'create'>,
  eq: $PropertyType<NodeT, 'eq'>,
  patches: $PropertyType<NodeT, 'patches'>
): NodeT => new NodeT(create, eq, patches)

export function bark(pith: N$Pith): S.S<PatchT> {
  return M.bark(o => {
    const pnodes: Array<NodeT> = []
    o(
      S.at(
        patch(parent => {
          const pnodesLength = pnodes.length
          const childNodes = parent.childNodes
          for (var index = 0; index < pnodesLength; index++) {
            const pi = pnodes[index]
            var li: ?Node
            for (var i = index, l = childNodes.length; i < l; i++)
              if (pi.eq((li = parent.childNodes[i]))) break
              else li = null
            if (li == null) parent.insertBefore(pi.create(), childNodes[index])
            else if (i !== index) parent.insertBefore(li, childNodes[index])
          }
          for (var i = childNodes.length - 1; i >= pnodesLength; i--)
            parent.removeChild(childNodes[i])
        })
      )
    )
    pith(v => {
      if (v instanceof S.S) return o(v)
      const index = pnodes.length
      pnodes.push(v)
      o(v.patches.map(p => patch(parent => p.v(parent.childNodes[index]))))
    })
  })
}
