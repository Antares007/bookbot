// @flow strict
import * as S from './stream'
import * as D from './disposable'

export class Patch {
  v: Node => void
  constructor(v: $PropertyType<Patch, 'v'>) {
    this.v = v
  }
}

export class Pith<A> {
  pith: ((PNode<A> | S.S<Patch | A>) => void, S.S<Node>) => void
  constructor(pith: $PropertyType<Pith<A>, 'pith'>) {
    this.pith = pith
  }
}

export class PNode<A> {
  create: () => Node
  eq: Node => boolean
  piths: S.S<Pith<A>>
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

export function run<A>(spith: S.S<Pith<A>>): S.S<Patch | A> {
  return S.switchLatest(
    spith.map(x => {
      var thisNode: ?Node
      const proxy = S.s(o =>
        o(
          S.delay(() => {
            thisNode && o(S.event(thisNode))
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
              x instanceof Patch
                ? new Patch(parent => x.v(parent.childNodes[index]))
                : x
            )
          )
        }
      }, proxy)
      return pnodes.length === 0
        ? p
        : p.startWith(
            new Patch(parent => {
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
