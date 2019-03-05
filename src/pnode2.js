// @flow strict
import * as S from './stream2'

export class Patch {
  v: Node => void
  constructor(v: $PropertyType<Patch, 'v'>) {
    this.v = v
  }
  static of(v: $PropertyType<Patch, 'v'>): Patch {
    return new Patch(v)
  }
}

export class Pith<A> {
  pith: ((PNode<A> | S.S<A>) => void) => void
  constructor(v: $PropertyType<Pith<A>, 'pith'>) {
    this.pith = v
  }
  static of(v: $PropertyType<Pith<A>, 'pith'>): Pith<A> {
    return new Pith(v)
  }
}

export class PNode<A> {
  create: () => Node
  eq: Node => boolean
  spith: S.S<Pith<A>>
  constructor(
    create: $PropertyType<PNode<A>, 'create'>,
    eq: $PropertyType<PNode<A>, 'eq'>,
    spith: $PropertyType<PNode<A>, 'spith'>
  ) {
    this.create = create
    this.eq = eq
    this.spith = spith
  }
  static of(
    create: $PropertyType<PNode<A>, 'create'>,
    eq: $PropertyType<PNode<A>, 'eq'>,
    spith: $PropertyType<PNode<A>, 'spith'>
  ): PNode<A> {
    return new PNode(create, eq, spith)
  }
}

export function run<A>(spith: S.S<Pith<A>>): S.S<Patch | A> {
  return S.switchLatest(
    spith.map(x => {
      var p = S.empty()
      var pnodes: Array<[number, () => Node, (Node) => boolean]> = []
      x.pith(x => {
        if (x instanceof S.S) {
          p = p.merge(x)
        } else {
          const index = pnodes.length
          pnodes.push([index, x.create, x.eq])
          p = p.merge(
            run(x.spith).map(x =>
              x instanceof Patch
                ? Patch.of(parent => x.v(parent.childNodes[index]))
                : x
            )
          )
        }
      })
      return pnodes.length === 0
        ? p
        : p.startWith(
            Patch.of(parent => {
              const pnodesCount = pnodes.length
              const childNodes = parent.childNodes
              const misplacedPnodes: Array<[Node, Node]> = []
              for (var i = 0; i < childNodes.length && pnodes.length > 0; i++) {
                const li = childNodes[i]
                for (var j = 0; j < pnodes.length; j++) {
                  const pi = pnodes[j]
                  if (pi[2](li)) {
                    pnodes.splice(j, 1)
                    if (pi[0] !== i)
                      misplacedPnodes.push([li, childNodes[pi[0]]])
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
          )
    })
  )
}
