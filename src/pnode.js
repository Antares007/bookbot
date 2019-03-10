// @flow strict
import * as S from './stream'
import * as D from './disposable'

type SS<A> = S.S<A> | A

export class PPatch {
  v: Node => void
  constructor(v: $PropertyType<PPatch, 'v'>) {
    this.v = v
  }
}
export function patch(v: $PropertyType<PPatch, 'v'>): PPatch {
  return new PPatch(v)
}

export class PPith<A> {
  pith: ((PNode<A> | S.S<A>) => void, S.S<Node>) => void
  constructor(v: $PropertyType<PPith<A>, 'pith'>) {
    this.pith = v
  }
}
export function pith<A>(v: $PropertyType<PPith<A>, 'pith'>): PPith<A> {
  return new PPith(v)
}

export class PNode<A> {
  create: () => Node
  eq: Node => boolean
  piths: S.S<PPith<A>>
  constructor(
    create: $PropertyType<PNode<A>, 'create'>,
    eq: $PropertyType<PNode<A>, 'eq'>,
    piths: $PropertyType<PNode<A>, 'piths'>
  ) {
    this.create = create
    this.eq = eq
    this.piths = piths
  }
}
export function node<A>(
  create: $PropertyType<PNode<A>, 'create'>,
  eq: $PropertyType<PNode<A>, 'eq'>,
  piths: SS<$PropertyType<PPith<A>, 'pith'> | PPith<A>>
): PNode<A> {
  return new PNode(
    create,
    eq,
    (piths instanceof S.S ? piths : S.at(piths)).map(x =>
      x instanceof PPith ? x : pith(x)
    )
  )
}

export function run<A>(spith: S.S<PPith<A>>): S.S<PPatch | A> {
  return S.switchLatest(
    spith.map(x => {
      var thisNode: ?Node
      const proxy = S.s(o =>
        o(
          S.delay(() => {
            thisNode && o(thisNode)
          }, 1)
        )
      )
      var p = S.empty()
      var pnodes: Array<PNode<A>> = []
      x.pith(x => {
        if (x instanceof S.S) {
          p = p.merge(x)
        } else {
          const index = pnodes.length
          pnodes.push(x)
          p = p.merge(
            run(x.piths).map(x =>
              x instanceof PPatch
                ? patch(parent => x.v(parent.childNodes[index]))
                : x
            )
          )
        }
      }, proxy)
      return pnodes.length === 0
        ? p
        : p.startWith(
            patch(parent => {
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
              thisNode = parent
            })
          )
    })
  )
}
