// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import type { SS } from './streamstaff'
import { ssmap } from './streamstaff'

export type NORay = {
  (S.S<N>): void,
  patch: (S.S<(Node) => void>) => void
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

export const run: N => S.S<(Node) => void> = memoized(n =>
  n.type === 'text' || n.type === 'comment'
    ? S.d(parent => {
        if (parent.textContent !== n.value) parent.textContent = n.value
      })
    : runPith(n.pith)
)

function runPith(pith: NPith): S.S<(Node) => void> {
  return S.s(o => {
    const [refO, ref] = S.proxy()
    const mergeO = makeMergeO(o)
    var ncount = 0
    const ns: Array<{ i: number, n: N, d: D.Disposable, currentIndex: number }> = []
    pith(
      Object.assign(
        v => {
          const nindex = ncount++
          mergeO(
            v.map((n: N) => parent => {
              const ap = ncount === ns.length ? nindex : findAppendPosition(nindex, ns)
              if (ap === -1 || ns[ap].i !== nindex) {
                console.log('add', n)
                const nodeData = {
                  i: nindex,
                  currentIndex: ap + 1,
                  n,
                  d: mergeO(
                    run(n).map(patch => node => patch(node.childNodes[nodeData.currentIndex]))
                  )
                }
                for (var k = nodeData.currentIndex, l = ns.length; k < l; k++) ns[k].currentIndex++
                ns.splice(nodeData.currentIndex, 0, nodeData)
                const pnodesLength = ns.length
                const childNodes = parent.childNodes
                var li: ?Node
                for (var index = nodeData.currentIndex; index < pnodesLength; index++) {
                  const x = ns[index]
                  li = null
                  for (var i = index, l = childNodes.length; i < l; i++)
                    if ((li = eq(childNodes[i], x.n))) break
                  if (li == null) parent.insertBefore(create(x.n), childNodes[index])
                  else if (i !== index) parent.insertBefore(li, childNodes[index])
                }
                if (ncount === ns.length) {
                  for (var i = childNodes.length - 1; i >= pnodesLength; i--)
                    console.log('rm', parent.removeChild(childNodes[i]))
                }
              } else {
                const nodeData = ns[ap]
                nodeData.n = n
                nodeData.d.dispose()
                nodeData.d = mergeO(
                  run(n).map(patch => node => patch(node.childNodes[nodeData.currentIndex]))
                )
                const on = parent.childNodes[nindex]
                if (eq(on, n)) return console.log('update canceled', n)
                console.log('update', parent)
                parent.insertBefore(create(n), on)
                console.log('rm_', parent.removeChild(on))
              }
            })
          )
        },
        { patch: ms => (mergeO(ms), void 0) }
      ),
      { ref }
    )
    mergeO(S.d(parent => refO(parent), 1))
  })
}

function makeMergeO<A>(
  o: (S.Next<A> | S.End | Error | D.Disposable) => void
): (S.S<A>) => D.Disposable {
  const dmap = new Map()
  o(D.create(() => dmap.forEach(d => d.dispose())))
  return sa => {
    var d = sa.run(e => {
      if (e instanceof S.End) {
        dmap.delete(ret)
        if (dmap.size === 0) o(e)
      } else o(e)
    })
    const ret = D.create(() => {
      dmap.delete(ret)
      d.dispose()
      if (dmap.size === 0) o(S.delay(() => o(S.end)))
    })
    dmap.set(sa, ret)
    return ret
  }
}

function runOn(n: N, i: number): S.S<(Node) => void> {
  return run(n).map(p => parent => p(parent.childNodes[i]))
}

function eq(node: Node, n: N): ?Node {
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
  line: Array<{ i: number, n: N, d: D.Disposable, currentIndex: number }>
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
