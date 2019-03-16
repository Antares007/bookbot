// @flow strict
import * as S from './stream'
import * as D from './disposable'
import * as M from './m'

export class Patch {
  patch: Node => void
  constructor(patch: $PropertyType<Patch, 'patch'>) {
    this.patch = patch
  }
}

type SS<A> = S.S<A> | A

type N$Pith = ((N | S.S<Patch>) => void) => void

export class N {
  constructor(create: () => Node, eq: Node => ?Node, pith: SS<N$Pith>) {
    this.create = create
    this.eq = eq
    this.patches =
      pith instanceof S.S ? S.switchLatest(pith.map(bark)) : bark(pith)
  }
  create: () => Node
  eq: Node => ?Node
  patches: S.S<Patch>
}

function bark(pith: N$Pith): S.S<Patch> {
  return M.bark(o => {
    const pnodes: Array<N> = []
    o(
      S.at(
        patch(parent => {
          const pnodesLength = pnodes.length
          const childNodes = parent.childNodes
          for (var index = 0; index < pnodesLength; index++) {
            const pi = pnodes[index]
            var li: ?Node
            for (var i = index, l = childNodes.length; i < l; i++)
              if ((li = pi.eq(parent.childNodes[i]))) break
            if (li == null) parent.insertBefore(pi.create(), childNodes[index])
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
          v.patches.map(p => patch(parent => p.patch(parent.childNodes[index])))
        )
      }
    })
  })
}

export const patch = (patch: $PropertyType<Patch, 'patch'>): Patch =>
  new Patch(patch)

export const node = (
  create: $PropertyType<N, 'create'>,
  eq: $PropertyType<N, 'eq'>,
  pith: SS<N$Pith>
): N => new N(create, eq, pith)

export const elm = (tag: string, pith: SS<N$Pith>, key?: ?string): N => {
  const TAG = tag.toUpperCase()
  return node(
    () => document.createElement(tag),
    n =>
      n instanceof HTMLElement &&
      n.nodeName === TAG &&
      (key == null || n.dataset.key === key)
        ? n
        : null,
    pith
  )
}

export const text = (texts: SS<string>): N =>
  node(
    () => document.createTextNode(''),
    n => (n instanceof Text ? n : null),
    o =>
      o(
        (texts instanceof S.S ? texts : S.at(texts)).map(text =>
          patch(n => {
            n.textContent = text
          })
        )
      )
  )
