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
      var pnodes: Array<PNode<A>> = []
      x.pith(x => {
        if (x instanceof S.S) {
          p = p.merge(x)
        } else {
          const index = pnodes.length
          pnodes.push(x)
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
              const pnodesLength = pnodes.length
              const childNodes = parent.childNodes
              for (var index = 0; index < pnodesLength; index++) {
                const pi = pnodes[index]
                var li: ?Node
                for (var i = index, l = childNodes.length; i < l; i++)
                  if (pi.eq((li = parent.childNodes[i]))) break
                  else li = null
                if (li == null)
                  parent.insertBefore(pi.create(), childNodes[index])
                else if (i !== index) parent.insertBefore(li, childNodes[index])
              }
              for (var i = childNodes.length - 1; i >= pnodesLength; i--)
                parent.removeChild(childNodes[i])
            })
          )
    })
  )
}
