// @flow strict
import * as S from './stream'
import * as D from './disposable'

export class PatchT {
  v: Node => void
  constructor(v: $PropertyType<PatchT, 'v'>) {
    this.v = v
  }
}

export class PithT<A> {
  pith: ((NodeT<A> | S.S<PatchT | A>) => void, S.S<Node>) => void
  constructor(pith: $PropertyType<PithT<A>, 'pith'>) {
    this.pith = pith
  }
}

export class NodeT<A> {
  create: () => Node
  eq: Node => boolean
  piths: S.S<PithT<A>>
  constructor(
    create: $PropertyType<NodeT<A>, 'create'>,
    eq: $PropertyType<NodeT<A>, 'eq'>,
    piths: $PropertyType<NodeT<A>, 'piths'>
  ) {
    this.create = create
    this.eq = eq
    this.piths = piths
  }
}

export const patch = (v: $PropertyType<PatchT, 'v'>): PatchT => new PatchT(v)

export const pith = <A>(pith: $PropertyType<PithT<A>, 'pith'>): PithT<A> =>
  new PithT(pith)

export const node = <A>(
  create: $PropertyType<NodeT<A>, 'create'>,
  eq: $PropertyType<NodeT<A>, 'eq'>,
  piths: $PropertyType<NodeT<A>, 'piths'>
): NodeT<A> => new NodeT(create, eq, piths)

export function run<A>(spith: S.S<PithT<A>>): S.S<PatchT | A> {
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
      var pnodes: Array<NodeT<A>> = []
      x.pith(x => {
        if (x instanceof S.S) {
          p = p.merge(x)
        } else {
          const index = pnodes.length
          pnodes.push(x)
          p = p.merge(
            run(x.piths).map(x =>
              x instanceof PatchT
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
