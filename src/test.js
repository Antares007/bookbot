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
    const srun = <A>(f: (S.Next<A>) => void, s: S.S<A>): void => {
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
    pith(v => {
      if (v.R === 'node') {
        const nIndex = nsLength++
        srun(e => {
          const n = e.value
          o(
            S.next(parent => {
              const childNodes = parent.childNodes
              var node: Node
              var li
              var apos = findAppendPosition(nIndex, ns)
              if (apos === -1 || ns[apos][0] !== nIndex) {
                const nodeAtPos = childNodes[++apos]
                ns.splice(apos, 0, [nIndex, n])
                if ((li = eq(nodeAtPos, n))) node = li
                else {
                  for (var i = ns.length, l = childNodes.length; i < l; i++)
                    if ((li = eq(childNodes[i], n))) break
                  parent.insertBefore((node = li ? li : create(n)), nodeAtPos)
                }
              } else {
                const oldN = ns[apos][1]
                const nodeAtPos = childNodes[apos]
                if (oldN.T === 'element' || oldN.T === 'elementNS') stop(oldN.s)
                ns[apos][1] = n
                if ((li = eq(nodeAtPos, n))) node = li
                else parent.replaceChild((node = create(n)), nodeAtPos)
              }
              if (n.T === 'element' || n.T === 'elementNS')
                srun(e => o(S.next(_ => e.value(node))), n.s)
              else if (node.textContent !== n.value) node.textContent = n.value
            })
          )
        }, v.s)
      } else {
        srun(o, v.s)
      }
    }, S.empty())
    srun(
      o,
      S.d(parent => {
        const childNodes = parent.childNodes
        for (var i = childNodes.length - 1, l = ns.length; i >= l; i--)
          console.log('rm', parent.removeChild(childNodes[i]))
      })
    )
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
