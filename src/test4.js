// @flow strict
import * as S from './S'
import * as D from './S/Disposable'
import type { Pith } from './pith'

type SS<+A> = S.S<A> | A
type NORay = { R: 'patch', s: S.S<(Node) => void> } | { R: 'node', s: S.S<N> }
type NIRay = { ref: S.S<Node> }

type N =
  | { T: 'element', tag: string, s: Node => D.Disposable, key: ?string }
  | { T: 'elementNS', tag: string, s: Node => D.Disposable, ns: string }
  | { T: 'text', tag: '#text', s: Node => D.Disposable }
  | { T: 'comment', tag: '#comment', s: Node => D.Disposable }

type NPith = Pith<NORay, NIRay, void>

opaque type Patch: (Node) => void = (Node) => void

export const patch = (s: S.S<(Node) => void>): NORay => ({ R: 'patch', s })
export const node = (ss: SS<N>): NORay => ({ R: 'node', s: ss instanceof S.S ? ss : S.d(ss) })

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
export const text = (ss: SS<string>): N => ({ T: 'text', tag: '#text', s: node => D.empty })
export const comment = (ss: SS<string>): N => ({
  T: 'comment',
  tag: '#comment',
  s: node => {
    return D.empty
  }
})

export function run(pith: NPith): Node => D.Disposable {
  return thisNode => {
    const ns: Array<[number, D.Disposable]> = []
    var nsLength = 0

    const disposables = []
    const dmap = new Map()
    const kmap = new Map()
    const childNodes = thisNode.childNodes
    for (var i = 0, l = childNodes.length; i < l; i++) {
      const node = childNodes[i]
      if (node instanceof HTMLElement) {
        const key = node.dataset.key
        if (key) kmap.set(key, i)
      }
    }
    pith(
      v => {
        if (v.R === 'node') {
          const index = nsLength++
          dmap.set(
            v,
            v.s.tryCatch().run(e => {
              var n: N
              if (e instanceof S.Next) {
                n = e.value
              } else if (e instanceof S.End) {
                dmap.delete(v)
                return
              } else n = text(e.message)

              const apos = findAppendPosition(index, ns)
              if (apos === -1 || index !== ns[apos][0]) {
                ns.splice(apos + 1, 0, [index, D.empty])
                if (ns.length === nsLength) {
                }
              } else {
              }
            })
          )
        } else {
          dmap.set(
            v,
            v.s.tryCatch().run(e => {
              if (e instanceof S.Next) e.value(thisNode)
              else if (e instanceof S.End) {
                dmap.delete(v)
              } else if (e instanceof Error) console.error(e)
            })
          )
        }
      },
      { ref: S.empty() }
    )
    return D.create(() => {
      dmap.forEach(d => d.dispose())
      ns.forEach(ni => ni[1].dispose())
    })
  }
}

function findAppendPosition<T>(n: number, line: Array<[number, T]>): number {
  var l = 0
  var r = line.length
  if (line.length === l) return -1
  if (line[r - 1][0] <= n) return r - 1
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
      return document.createTextNode('')
    case 'comment':
      return document.createComment('')
    default:
      throw new Error('never')
  }
}
