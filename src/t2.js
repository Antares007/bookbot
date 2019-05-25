// @flow strict
import * as S from './t'
import * as D from './S/Disposable'
import type { Pith } from './pith'

type SS<+A> = S.S<A> | A
type NORay = { R: 'patch', s: S.S<(Node) => void> } | { R: 'node', s: S.S<N> }
type NIRay = { ref: S.S<Node> }

type N =
  | { T: 'element', tag: string, s: S.S<(Node) => void>, key: ?string }
  | { T: 'elementNS', tag: string, s: S.S<(Node) => void>, ns: string }
  | { T: 'text', tag: '#text', s: S.S<(Node) => void> }
  | { T: 'comment', tag: '#comment', s: S.S<(Node) => void> }

type NPith = Pith<NORay, NIRay, void>

opaque type Patch: (Node) => void = (Node) => void

export const patch = (s: S.S<(Node) => void>): NORay => ({ R: 'patch', s })
export const node = (ss: SS<N>): NORay => ({ R: 'node', s: ss.T === 's' ? ss : S.d(ss) })

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
  s: S.map(
    text => node => {
      if (node.textContent !== text) node.textContent = text
    },
    typeof ss === 'string' ? S.d(ss) : ss
  )
})
export const comment = (ss: SS<string>): N => ({
  T: 'comment',
  tag: '#comment',
  s: S.map(
    text => node => {
      if (node.textContent !== text) node.textContent = text
    },
    typeof ss === 'string' ? S.d(ss) : ss
  )
})

export function run(pith: NPith): S.S<(Node) => void> {
  return S.s(o => {
    const ns: Array<[number, void]> = []
    var nsLength = 0
    const rays: Array<S.S<(Node) => void>> = []
    pith(
      v => {
        if (v.R === 'node') {
          const nIndex = nsLength++
          rays.push(
            S.switchLatest(
              S.map(n => {
                var cIndex = -1
                return S.merge(
                  S.d(thisNode => {
                    const childNodes = thisNode.childNodes
                    var apos = findAppendPosition(nIndex, ns)
                    if (apos === -1 || nIndex !== ns[apos][0]) {
                      ++apos
                      var node = eq(childNodes[apos], n)
                      if (!node) {
                        var li = null
                        for (var i = ns.length, l = childNodes.length; i < l; i++)
                          if ((li = eq(childNodes[i], n))) break
                        node = li
                          ? thisNode.insertBefore(li, childNodes[apos])
                          : thisNode.insertBefore(create(n), childNodes[apos])
                      }
                      ns.splice(apos, 0, [nIndex, void 0])
                      cIndex = apos
                    } else {
                      if (!eq(childNodes[apos], n))
                        thisNode.replaceChild(create(n), childNodes[apos])
                      cIndex = apos
                    }
                  }),
                  S.map(patch => node => patch(node.childNodes[cIndex]), n.s)
                )
              }, v.s)
            )
          )
        } else {
          rays.push(v.s)
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

    return S.merge(...rays).pith(o)
  })
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
