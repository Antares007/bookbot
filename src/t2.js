// @flow strict
import * as S from './t'
import * as D from './S/Disposable'
import type { Pith } from './pith'

export type SS<+A> = S.S<A> | A

export type NORay = { T: 'patch', s: S.S<(Node) => void> } | { T: 'node', s: S.S<N> }

export type NIRay = { ref: S.S<Node> }

export opaque type R: { R: 'patch', r: Node => void } = { R: 'patch', r: Node => void }

export type N =
  | { T: 'element', tag: string, s: S.S<R>, key: ?string }
  | { T: 'elementNS', tag: string, s: S.S<R>, ns: string }
  | { T: 'text', tag: '#text', s: S.S<string> }
  | { T: 'comment', tag: '#comment', s: S.S<string> }

export type NPith = Pith<NORay, NIRay, void>

export const patch = (s: S.S<(Node) => void>): NORay => ({ T: 'patch', s })
export const node = (ss: SS<N>): NORay => ({
  T: 'node',
  s: ss.T === 's' ? ss : S.d(ss)
})

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
export const text = (ss: SS<string>): N => ({
  T: 'text',
  tag: '#text',
  s: typeof ss === 'string' ? S.d(ss) : ss
})
export const comment = (ss: SS<string>): N => ({
  T: 'comment',
  tag: '#comment',
  s: typeof ss === 'string' ? S.d(ss) : ss
})

export function run(pith: NPith): S.S<R> {
  return S.s(o => {
    const ns: Array<number> = []
    var nsLength = 0
    const rays: Array<S.S<(Node) => void>> = []
    pith(
      r => {
        if (r.T === 'node') {
          const nIndex = nsLength++
          rays.push(
            S.switchLatest(
              S.map(
                n =>
                  S.map(
                    patch => thisNode => {
                      const childNodes = thisNode.childNodes
                      var node
                      var apos = findAppendPosition(nIndex, ns)
                      if (apos === -1 || nIndex !== ns[apos]) {
                        ++apos
                        node = eq(childNodes[apos], n)
                        if (!node) {
                          var li = null
                          for (var i = ns.length, l = childNodes.length; i < l; i++)
                            if ((li = eq(childNodes[i], n))) break
                          node = li
                            ? thisNode.insertBefore(li, childNodes[apos])
                            : thisNode.insertBefore(create(n), childNodes[apos])
                        }
                        ns.splice(apos, 0, nIndex)
                      } else if (!eq((node = childNodes[apos]), n))
                        node = thisNode.replaceChild(create(n), node)

                      if (typeof patch === 'string')
                        node.textContent === patch || (node.textContent = patch)
                      else patch.r(node)
                    },
                    n.s
                  ),
                r.s
              )
            )
          )
        } else {
          rays.push(r.s)
        }
      },
      { ref: S.empty }
    )

    rays.push(
      S.d(node => {
        for (var i = node.childNodes.length - 1; i >= ns.length; i--)
          node.removeChild(node.childNodes[i])
      })
    )

    return S.map(r => ({ R: 'patch', r }), S.merge(...rays)).pith(o)
  })
}

function findAppendPosition(n: number, line: Array<number>): number {
  var l = 0
  var r = line.length
  if (line.length === l) return -1
  if (line[r - 1] <= n) return r - 1
  while (true) {
    if (l < r) {
      const m = ~~((l + r) / 2) | 0
      if (line[m] > n) {
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

function eq(node: ?Node, n: N): ?Node {
  return !node
    ? node
    : node.nodeName !== n.tag ||
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
