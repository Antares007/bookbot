// @flow strict
import * as S from './t'
import { binarySearchRightmost } from './S/scheduler'
import * as D from './S/Disposable'
import type { Pith } from './pith'

export type SS<+A> = S.S<A> | A

export type NORay = { T: 'patch', s: S.S<(Node) => void> } | { T: 'node', s: S.S<N> }

export type NIRay = { ref: S.S<Node> }

export opaque type R: { R: 'patch', r: Node => void } = { R: 'patch', r: Node => void }

export type N =
  | { T: 'element', tag: string, s: HTMLElement => D.Disposable, key: ?string }
  | { T: 'elementNS', tag: string, s: Element => D.Disposable, ns: string }
  | { T: 'text', tag: '#text', s: Text => D.Disposable }
  | { T: 'comment', tag: '#comment', s: Comment => D.Disposable }

export type NPith = Pith<NORay, NIRay, void>

export const patch = (s: S.S<(Node) => void>): NORay => ({ T: 'patch', s })
export const node = (ss: SS<N>): NORay => ({
  T: 'node',
  s: ss.T === 's' ? ss : S.d(ss)
})
export const elm = (tag: string, pith: NPith, key?: string): N => ({
  T: 'element',
  tag: tag.toUpperCase(),
  s: elementBark(pith),
  key
})
export const elmNS = (ns: string, tag: string, pith: NPith): N => ({
  T: 'elementNS',
  tag: tag.toUpperCase(),
  s: elementBark(pith),
  ns
})
export const text = (ss: SS<string>): N => ({
  T: 'text',
  tag: '#text',
  s: characterDataBark(typeof ss === 'string' ? S.d(ss) : ss)
})
export const comment = (ss: SS<string>): N => ({
  T: 'comment',
  tag: '#comment',
  s: characterDataBark(typeof ss === 'string' ? S.d(ss) : ss)
})

export function characterDataBark<T: CharacterData>(s: S.S<string>): T => D.Disposable {
  return charData =>
    S.run(r => {
      if (r.T === 'end') return
      const text = r.T === 'next' ? r.value : r.error.message
      charData.textContent !== text && (charData.textContent = text)
    }, s)
}

export function elementBark<Elm: Element>(pith: NPith): Elm => D.Disposable {
  return elm => {
    const childNodes = elm.childNodes
    const indices: Array<number> = []
    const nds: Array<D.Disposable> = []
    const rays: Array<S.S<void>> = []
    pith(
      r => {
        if (r.T === 'node') {
          const nIndex = nds.length
          nds.push(D.empty)
          rays.push(
            S.map(n => {
              var node
              var pos = binarySearchRightmost(nIndex, indices)
              if (pos === -1 || indices[pos] < nIndex) {
                if (!eq((node = childNodes[++pos]), n)) {
                  var li = null
                  for (var i = indices.length, l = childNodes.length; i < l && li === null; i++)
                    if (eq(childNodes[i], n)) li = childNodes[i]
                  node = li ? elm.insertBefore(li, node) : elm.insertBefore(create(n), node)
                }
                indices.splice(pos, 0, nIndex)
              } else if (!eq((node = childNodes[pos]), n)) node = elm.replaceChild(create(n), node)
              nds[nIndex].dispose()
              if (n.T === 'element' && node instanceof HTMLElement) nds[nIndex] = n.s(node)
              else if (n.T === 'text' && node instanceof Text) nds[nIndex] = n.s(node)
              else if (n.T === 'elementNS' && node instanceof Element) nds[nIndex] = n.s(node)
              else if (n.T === 'comment' && node instanceof Comment) nds[nIndex] = n.s(node)
              else throw new Error('cant find correct node')
            }, r.s)
          )
        } else {
          rays.push(S.map(p => p(elm), r.s))
        }
      },
      { ref: S.empty }
    )
    const raysd = S.run(r => {}, S.merge(...rays))
    return D.create(() => {
      nds.forEach(d => d.dispose())
      raysd.dispose()
    })
  }
}

function eq(node: ?Node, n: N): boolean {
  return (
    !!node &&
    node.nodeName === n.tag &&
    (n.T !== 'element' || !n.key || !(node instanceof HTMLElement) || node.dataset.key === n.key)
  )
}

function create(n: N): Node {
  console.log('c', n.tag)
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
