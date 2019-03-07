// @flow strict
import * as S from './stream'
import * as D from './disposable'

type SS<A> = S.S<A> | A

export class Patch {
  v: Node => void
  constructor(v: $PropertyType<Patch, 'v'>) {
    this.v = v
  }
}
export function patch(v: $PropertyType<Patch, 'v'>): Patch {
  return new Patch(v)
}

export class Pith<A> {
  pith: ((PNode<A> | S.S<A>) => void, S.S<Node>) => void
  constructor(v: $PropertyType<Pith<A>, 'pith'>) {
    this.pith = v
  }
}
export function pith<A>(v: $PropertyType<Pith<A>, 'pith'>): Pith<A> {
  return new Pith(v)
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
export function pnode<A>(
  create: $PropertyType<PNode<A>, 'create'>,
  eq: $PropertyType<PNode<A>, 'eq'>,
  piths: SS<$PropertyType<Pith<A>, 'pith'> | Pith<A>>
): PNode<A> {
  return new PNode(
    create,
    eq,
    (piths instanceof S.S ? piths : S.at(piths)).map(x =>
      x instanceof Pith ? x : pith(x)
    )
  )
}

export function run<A>(spith: S.S<Pith<A>>): S.S<Patch | A> {
  return S.switchLatest(
    spith.map(x => {
      var on: ?Node
      const os = []
      var p = S.empty()
      var pnodes: Array<PNode<A>> = []
      x.pith(
        x => {
          if (x instanceof S.S) {
            p = p.merge(x)
          } else {
            const index = pnodes.length
            pnodes.push(x)
            p = p.merge(
              run(x.piths).map(x =>
                x instanceof Patch
                  ? patch(parent => x.v(parent.childNodes[index]))
                  : x
              )
            )
          }
        },
        S.s(o => {
          if (on) {
            o(on)
            o(S.delay(() => o(S.end)))
          } else os.push(o)
        })
      )
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
              if (os.length === 0) return
              os[0](
                S.delay(() => {
                  var o
                  on = parent
                  while ((o = os.shift())) o(on)
                }, 1)
              )
            })
          )
    })
  )
}
