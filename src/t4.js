// flow strict
import * as S from './t'
import { binarySearchRightmost } from './S/scheduler'
import * as D from './S/Disposable'
import type { Pith } from './pith'

export type SS<+A> = S.S<A> | A

export type NORay = { T: 'patch', s: S.S<(Node) => void> } | { T: 'node', s: S.S<N> }

export type NIRay = { ref: S.S<Node> }

export opaque type R: { R: 'patch', r: Node => void } = { R: 'patch', r: Node => void }

export opaque type NElement = {
  T: 'element',
  tag: string,
  s: HTMLElement => D.Disposable,
  key: ?string
}
export opaque type NElementNS = {
  T: 'elementNS',
  tag: string,
  s: Element => D.Disposable,
  ns: string
}
export opaque type NText = { T: 'text', tag: '#text', s: Text => D.Disposable }
export opaque type NComment = { T: 'comment', tag: '#comment', s: Comment => D.Disposable }
export type N = NElement | NElementNS | NText | NComment

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
    const indices: Array<number> = []
    const nds: Array<?D.Disposable> = []
    const rays: Array<S.S<void>> = []
    const find = <B>(f: Node => ?B, fromIndex: number, array: NodeList<Node>): ?B => {
      for (var i = fromIndex, l = array.length; i < l; i++) {
        const mb = f(array[i])
        if (mb) return mb
      }
    }

    pith(
      r => {
        if (r.T === 'node') {
          const nIndex = nds.length++
          nds.push()
          rays.push(
            S.map(n => {
              const d = nds[nIndex]
              d && d.dispose()
              var pos = binarySearchRightmost(nIndex, indices)
              if (pos === -1 || indices[pos] < nIndex) {
                ++pos
                if (n.T === 'element') {
                  nds[nIndex] = n.s(
                    elm.insertBefore(
                      find(x => eqElement(x, n), indices.length, elm.childNodes) ||
                        createElement(n),
                      elm.childNodes[pos]
                    )
                  )
                } else if (n.T === 'text') {
                  nds[nIndex] = n.s(
                    elm.insertBefore(
                      find(x => eqText(x, n), indices.length, elm.childNodes) || createText(n),
                      elm.childNodes[pos]
                    )
                  )
                }
                indices.splice(pos, 0, nIndex)
              } else {
                if (n.T === 'element') {
                  var child = eqElement(elm.childNodes[pos], n)
                  if (!child) elm.replaceChild((child = createElement(n)), elm.childNodes[pos])
                  nds[nIndex] = n.s(child)
                } else if (n.T === 'text') {
                  var child = eqText(elm.childNodes[pos], n)
                  if (!child) elm.replaceChild((child = createText(n)), elm.childNodes[pos])
                  nds[nIndex] = n.s(child)
                }
              }
            }, S.flatMapError(error => S.d(text(error.message)), r.s))
          )
        } else {
          rays.push(S.map(p => p(elm), r.s))
        }
      },
      { ref: S.empty }
    )

    const raysd = S.run(r => {
      if (r.T === 'error') {
        rmd.dispose()
        const lines = r.error.stack.split('\n')
        elm.innerHTML = `<div class='error'><div>${lines.shift()}</div><ul>${lines
          .map(l => `<li>${l}</li>`)
          .join('')}</ul></div>`
      }
    }, S.merge(...rays))
    const rmd = S.delay(() => {
      for (var i = elm.childNodes.length - 1; i >= indices.length; i--)
        console.log('rm', elm.removeChild(elm.childNodes[i]))
    })

    return D.create(() => {
      nds.forEach(d => d && d.dispose())
      raysd.dispose()
      rmd.dispose()
    })
  }
}

function eqElement(node: Node, n: NElement): ?HTMLElement {
  return node instanceof HTMLElement && node.nodeName === n.tag && node.dataset.key == n.key
    ? node
    : null
}
function eqText(node: Node, n: NText): ?Text {
  return node instanceof Text ? node : null
}

function createElement(n: NElement): HTMLElement {
  const elm = document.createElement(n.tag)
  if (n.key) elm.dataset.key = n.key
  return elm
}
function createText(n: NText): Text {
  return document.createTextNode('loading')
}
