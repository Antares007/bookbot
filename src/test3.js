// @flow strict
import * as S from './S'
import * as D from './S/Disposable'
import type { Pith } from './pith'

type PatchRay = { R: 'patch', s: S.S<(Node) => void> }
type NodeRay = { R: 'node', s: S.S<N> }

type N =
  | { T: 'element', tag: string, s: S.S<Patch>, key: ?string }
  | { T: 'elementNS', tag: string, s: S.S<Patch>, ns: string }
  | { T: 'text', tag: '#text', value: string }
  | { T: 'comment', tag: '#comment', value: string }

type SS<+A> = S.S<A> | A
type NPith = Pith<NodeRay | PatchRay, S.S<{ type: 'ref', node: Node }>, void>

opaque type Patch: (Node) => void = (Node) => void

export const patch = (s: S.S<(Node) => void>): PatchRay => ({ R: 'patch', s })
export const node = (ss: SS<N>): NodeRay => ({ R: 'node', s: ss instanceof S.S ? ss : S.d(ss) })

export const elm = (tag: string, pith: NPith, key?: string): N => ({
  T: 'element',
  tag: tag.toUpperCase(),
  s: run(pith),
  key
})
export const elmNS = (ns: string, tag: string, pith: NPith): N => ({
  T: 'elementNS',
  tag: tag.toUpperCase(),
  s: run(pith),
  ns
})
export const text = (value: string): N => ({ T: 'text', tag: '#text', value })
export const comment = (value: string): N => ({ T: 'comment', tag: '#comment', value })

export function run(pith: NPith): S.S<Patch> {
  return S.s(o => {
    const dmap = new Map()
    o(D.create(() => dmap.forEach(d => d.dispose())))
    const start = <A>(f: (S.Next<A>) => void, s: S.S<A>): void => {
      const d = s.run(e => {
        if (e instanceof S.Next) f(e)
        else if (e instanceof S.End) {
          dmap.delete(s)
          if (dmap.size === 0) o(e)
        } else o(e)
      })
      dmap.set(s, d)
    }
    const stop = <A>(s: S.S<A>): void => {
      const d = dmap.get(s)
      if (d) dmap.delete(s), d.dispose()
    }
    const ns: Array<[number, N]> = []
    var nsLength = 0
    var handler = combine
    pith(v => {
      if (v.R === 'node') {
        const index = nsLength++
        start(e => handler(e.value, index), v.s)
      } else {
        start(o, v.s)
      }
    }, S.empty())

    function combine(n: N, index: number) {
      const apos = findAppendPosition(index, ns)
      if (apos === -1 || index !== ns[apos][0]) {
        ns.splice(apos + 1, 0, [index, n])
        if (ns.length === nsLength) {
          handler = update
          ns.forEach(([index, n]) => {
            if (n.T === 'element' || n.T === 'elementNS')
              start(o, n.s.map(p => parent => p(parent.childNodes[index])))
          })
          o(
            S.next(parent => {
              const childNodes = parent.childNodes
              var li: ?Node
              for (var index = 0; index < nsLength; index++) {
                const n = ns[index][1]
                li = null
                for (var i = index, l = childNodes.length; i < l; i++)
                  if ((li = eq(childNodes[i], n))) break
                if (li == null) parent.insertBefore(create(n), childNodes[index])
                else if (i !== index) parent.insertBefore(li, childNodes[index])
              }
              for (var i = childNodes.length - 1; i >= nsLength; i--)
                console.log('rm', parent.removeChild(childNodes[i]))
            })
          )
        }
      } else ns[apos][1] = n
    }
    function update(n: N, index: number) {
      const oldN = ns[index][1]
      if (n.T === 'element' || n.T === 'elementNS')
        start(o, n.s.map(p => parent => p(parent.childNodes[index])))
      if (oldN.T === 'element' || oldN.T === 'elementNS') stop(oldN.s)
      o(
        S.next(parent => {
          const nodeAtIndex = parent.childNodes[index]
          var node
          if ((node = eq(nodeAtIndex, n))) {
            if ((n.T === 'text' || n.T === 'comment') && node.textContent !== n.value)
              node.textContent = n.value
          } else parent.replaceChild(create(n), nodeAtIndex)
        })
      )
    }
  })
}

function findAppendPosition<T>(n: number, line: Array<[number, T]>): number {
  var l = 0
  var r = line.length
  while (true) {
    if (l < r) {
      const m = ~~((l + r) / 2) | 0
      if (line[m][0] > n) {
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

function eq(node: Node, n: N): ?Node {
  if (!node) return null
  return node.nodeName !== n.tag ||
    (n.T === 'element' && n.key && node instanceof HTMLElement && node.dataset.key !== n.key)
    ? null
    : node
}

function create(n: N): Node {
  switch (n.T) {
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
