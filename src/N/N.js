// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import type { SS } from './streamstaff'
import { ssmap } from './streamstaff'

export type NORay = {
  (SS<N>): void,
  patch: (SS<(Node) => void>) => void
}
export type NIRay = { ref: S.S<Node> }
export type NPith = (NORay, NIRay) => void

export type N =
  | { type: 'element', tag: string, pith: NPith, key?: string }
  | { type: 'elementNS', tag: string, pith: NPith, ns: string }
  | { type: 'text', tag: '#text', value: string }
  | { type: 'comment', tag: '#comment', value: string }

export const elm = (tag: string, pith: NPith, key?: string): N => ({
  type: 'element',
  tag: tag.toUpperCase(),
  pith,
  key
})
export const elmNS = (ns: string, tag: string, pith: NPith): N => ({
  type: 'elementNS',
  tag: tag.toUpperCase(),
  pith,
  ns
})
export const text = (value: string): N => ({ type: 'text', tag: '#text', value })
export const comment = (value: string): N => ({ type: 'comment', tag: '#comment', value })

const cache: Map<N, S.S<(Node) => void>> = new Map()

function memoized<A, B>(f: A => B): A => B {
  const cache = new Map()
  return a => {
    var b = cache.get(a)
    if (b) return b
    b = f(a)
    cache.set(a, b)
    return b
  }
}

const run: N => S.S<(Node) => void> = memoized(n =>
  n.type === 'text' || n.type === 'comment'
    ? S.d(parent => {
        if (parent.textContent !== n.value) parent.textContent = n.value
      })
    : runPith(n.pith)
)

function runPith(pith: NPith): S.S<(Node) => void> {
  return S.s(o => {
    const dmap = new Map()
    o(D.create(() => dmap.forEach(d => d.dispose())))

    const [refO, ref] = S.proxy()
    const patches: Array<(Node) => void> = []

    const mergeO = makeMergeO(o)

    var i = 0
    const ns: Array<{ i: number, n: N, d: D.Disposable }> = []
    pith(
      Object.assign(
        ss => {
          const index = i++
          const map = (n: N) => {
            const at = index
            const ap = findAppendPosition(at, ns)
            if (ap === -1 || ns[ap][0] !== at) {
              ns.splice(ap + 1, 0, {
                i: at,
                n,
                d: mergeO(run(n).map(patch => node => patch(node.childNodes[ap + 1])))
              })
              for (var k = ap + 2, l = ns.length; k < l; k++);
              return (node: Node) => {
                //
              }
            } else {
              ns[ap].n = n
              ns[ap].d = mergeO(run(n))
            }
            return (node: Node) => {}
          }
          const stop = mergeO(ss instanceof S.S ? ss.map(n => map(n)) : map(ss))
        },
        {
          patch: ms => {
            mergeO(ms)
          }
        }
      ),
      { ref }
    )
    //          return parent => {
    //            const pnodesLength = nodes.length
    //            const childNodes = parent.childNodes
    //            var li: ?Node
    //            for (var index = 0; index < pnodesLength; index++) {
    //              const x = nodes[index]
    //              li = null
    //              for (var i = index, l = childNodes.length; i < l; i++)
    //                if ((li = eq(childNodes[i], x))) break
    //              if (li == null) parent.insertBefore(create(x), childNodes[index])
    //              else if (i !== index) parent.insertBefore(li, childNodes[index])
    //            }
    //            for (var i = childNodes.length - 1; i >= pnodesLength; i--)
    //              console.log('rm', parent.removeChild(childNodes[i]))
    //            for (var i = 0, l = patches.length; i < l; i++) patches[i](parent)
    //            refO(parent)
    //          }
  })
}

function makeMergeO<A>(
  o: (S.Next<A> | S.End | Error | D.Disposable) => void
): (S.S<A> | A) => D.Disposable {
  const dmap = new Map()
  o(D.create(() => dmap.forEach(d => d.dispose())))
  return x => {
    var d =
      x instanceof S.S
        ? x.run(e => {
            if (e instanceof S.End) {
              dmap.delete(x)
              if (dmap.size === 0) o(e)
            } else o(e)
          })
        : S.delay(() => {
            dmap.delete(x)
            if (dmap.size === 0) o((d = S.delay(() => o(S.end))))
            o(S.next(x))
          })
    const ret = D.create(() => {
      dmap.delete(x)
      d.dispose()
    })
    dmap.set(x, ret)
    return ret
  }
}

function runOn(n: N, i: number): S.S<(Node) => void> {
  return run(n).map(p => parent => p(parent.childNodes[i]))
}

function eq(node: Node, n): ?Node {
  return node.nodeName !== n.tag ||
    (n.type === 'element' && n.key && node instanceof HTMLElement && node.dataset.key !== n.key)
    ? null
    : node
}

function create(n: N): Node {
  switch (n.type) {
    case 'element':
      const elm = document.createElement(n.tag)
      if (n.key) elm.dataset.key = n.key
      return elm
    case 'elementNS':
      return document.createElementNS(n.ns, n.tag)
    case 'text':
      return document.createTextNode(n.value)
    case 'comment':
      return document.createComment(n.value)
    default:
      throw new Error('never')
  }
}

function combineSS<A, B>(
  initF: (Array<A>) => B,
  updateF: (A, number) => B,
  array: Array<SS<A>>
): S.S<B> {
  return S.s(o => {
    const dmap = new Map()
    const as: Array<A> = new Array(array.length)
    const idxs = []
    o(D.create(() => dmap.forEach(d => d.dispose())))
    for (let index = 0, l = array.length; index < l; index++) {
      const a = array[index]
      if (a instanceof S.S) {
        idxs.push(index)
        dmap.set(
          index,
          S.run(e => {
            if (e instanceof S.Next) {
              if (idxs.length === 0) o(S.next(updateF(e.value, index)))
              else {
                as[index] = e.value
                const pos = idxs.indexOf(index)
                if (pos !== -1) idxs.splice(pos, 1)
                if (idxs.length === 0) o(S.next(initF(as)))
              }
            } else if (e instanceof S.End) {
              dmap.delete(index)
              if (dmap.size === 0) o(e)
            } else o(e)
          }, a)
        )
      } else as[index] = a
    }
    if (idxs.length === 0) {
      o(
        S.delay(() => {
          o(S.next(initF(as)))
          o(S.delay(() => o(S.end)))
        })
      )
    }
  })
}

export function findAppendPosition<T>(
  n: number,
  line: Array<{ i: number, n: N, d: D.Disposable }>
): number {
  var l = 0
  var r = line.length
  while (true) {
    if (l < r) {
      const m = ~~((l + r) / 2) | 0
      if (line[m].i > n) {
        r = m
        continue
      } else {
        l = m + 1
        continue
      }
    } else {
      return l - 1
    }
  }
  throw new Error('never')
}
