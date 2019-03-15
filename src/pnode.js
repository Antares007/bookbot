// @flow strict
import * as S from './stream'
import * as D from './disposable'
import * as M from './m'

export class R {
  v: Node => void
  constructor(v: $PropertyType<R, 'v'>) {
    this.v = v
  }
}

type SS<A> = S.S<A> | A

type N$Pith = ((N | S.S<R>) => void) => void

export class N {
  constructor(create: () => Node, eq: Node => ?Node, pith: SS<N$Pith>) {
    this.create = create
    this.eq = eq
    this.rs =
      pith instanceof S.S
        ? S.switchLatest(pith.map(pith => bark(ring(pith))))
        : bark(ring(pith))
    function ring(pith) {
      return o => {
        pith(v => {
          o(v)
        })
      }
    }
  }
  create: () => Node
  eq: Node => ?Node
  rs: S.S<R>
}
// function makeStore(storeClass: Class<NodeT>) {
//   return new storeClass()
// }
function bark(pith: N$Pith): S.S<R> {
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
      if (v instanceof S.S) o(v)
      else {
        const index = pnodes.length

        pnodes.push(v)
        o(v.rs.map(p => patch(parent => p.v(parent.childNodes[index]))))
      }
    })
  })
}

export const patch = (v: $PropertyType<R, 'v'>): R => new R(v)

export const node = (
  create: $PropertyType<N, 'create'>,
  eq: $PropertyType<N, 'eq'>,
  pith: SS<N$Pith>
): N => new N(create, eq, pith)

export const elm = (tag: string, pith: SS<N$Pith>): N => {
  return node(
    () => document.createElement(tag),
    n =>
      n instanceof HTMLElement && n.nodeName === tag.toUpperCase() ? n : null,
    pith
  )
}

const text = (texts: S.S<string>): N =>
  node(
    () => document.createTextNode(''),
    n => (n instanceof Text ? n : null),
    o =>
      o(
        texts.map(text =>
          patch(n => {
            n.textContent = text
          })
        )
      )
  )

elm('div', o => {
  o(
    elm('button', o => {
      o(S.at(patch(node => {})))
      o(text(S.at('')))
    })
  )
  o(S.at(patch(node => {})))
  o(text(S.at('')))
})
