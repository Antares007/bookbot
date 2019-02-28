// @flow strict
import { S, event } from './stream'

export type PNode$Pith<N> = {
  type: 'pith',
  pith: ((S<PNode$Node<N>> | PNode$Node<N>) => void) => void
}

export type PNode$Node<N> = {
  type: 'node',
  create: () => N,
  eq: N => boolean,
  patch: S<(N) => void> | (N => void)
}

export const node = <N>(
  create: () => N,
  eq: N => boolean,
  patch: S<(N) => void> | (N => void)
): PNode$Node<N> => ({ type: 'node', create, eq, patch })

export const pith = <N>(
  pith: ((S<PNode$Node<N>> | PNode$Node<N>) => void) => void
): PNode$Pith<N> => ({ type: 'pith', pith })

export function run<N: Node>(
  pith: S<PNode$Pith<N>> | PNode$Pith<N>
): S<(N) => void> {
  return pith instanceof S ? S.switchLatest(pith.map(p1)) : p1(pith)
}

function p1<N: Node>(pith: PNode$Pith<N>): S<(N) => void> {
  const patches: Array<S<(N) => void>> = []
  var i = 0
  pith.pith(pnode => {
    const index = i++
    patches.push(
      pnode instanceof S
        ? S.switchLatest(pnode.map(pnode => p2(index, pnode)))
        : p2(index, pnode)
    )
  })
  patches.push(
    S.at(parent => {
      for (var j = parent.childNodes.length - 1; j >= i; j--)
        parent.removeChild(parent.childNodes[j])
    })
  )
  var lastPatches = []
  return S.combine(
    (...array) => parent => {
      var i = 0
      const l = array.length
      for (; i < l; i++) if (array[i] !== lastPatches[i]) break
      for (; i < l; i++) array[i](parent)
      lastPatches = array
    },
    ...patches
  )
}

function p2<N: Node>(index: number, vnode: PNode$Node<N>): S<(N) => void> {
  return (vnode.patch instanceof S ? vnode.patch : S.at(vnode.patch)).map(
    p => parent => {
      var li: ?N
      for (var i = index, l = parent.childNodes.length; i < l; i++)
        if (vnode.eq((li = parent.childNodes[i]))) break
        else li = null
      if (li == null)
        li = parent.insertBefore(vnode.create(), parent.childNodes[index])
      else if (i !== index) parent.insertBefore(li, parent.childNodes[index])
      p(li)
    }
  )
}
