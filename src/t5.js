// @flow strict
import type { Pith } from './pith'

export opaque type B<N: Element> = (N) => void

export type NPith<N: Element> = Pith<
  | string
  | { R: 'Element', tag: string, b: B<HTMLElement>, key?: string }
  | { R: 'ElementNS', tag: string, ns: string, b: B<Element> }
  | { R: 'Comment', value: string },
  N,
  void
>

function elementBark<N: Element>(pith: NPith<N>): B<N> {
  return element => {
    const { childNodes } = element
    var index = 0
    pith(r => {
      const ref: ?Node = element.childNodes[index++]
      if (typeof r === 'string') {
        if (ref && ref.nodeName === '#text') ref.textContent !== r && (ref.textContent = r)
        else element.insertBefore(document.createTextNode(r), ref)
      } else if (r.R === 'Element') {
        const found = find(
          n =>
            n instanceof HTMLElement && n.tagName === r.tag && n.dataset.key === r.key ? n : null,
          index,
          childNodes
        )
        if (found) {
          if (found !== ref) element.insertBefore(found, ref)
          r.b(found)
        } else {
          const elm = document.createElement(r.tag)
          if (r.key) elm.dataset.key = r.key
          r.b(element.insertBefore(elm, ref))
        }
      } else if (r.R === 'ElementNS') {
        const found = find(
          n => (n instanceof Element && n.tagName === r.tag ? n : null),
          index,
          childNodes
        )
        if (found) {
          if (found !== ref) element.insertBefore(found, ref)
          r.b(found)
        } else r.b(element.insertBefore(document.createElementNS(r.ns, r.tag), ref))
      } else {
        if (ref && ref.nodeName === '#comment')
          ref.textContent !== r.value && (ref.textContent = r.value)
        else element.insertBefore(document.createComment(r.value), ref)
      }
    }, element)
    var n
    while ((n = element.childNodes[index])) element.removeChild(n)
  }
}

function find<N, B>(f: N => ?B, fromIndex: number, array: NodeList<N>): ?B {
  for (var i = fromIndex, l = array.length; i < l; i++) {
    const mb = f(array[i])
    if (mb) return mb
  }
}

export const elm = (tag: string, pith: NPith<HTMLElement>, key?: string) => ({
  R: 'Element',
  tag: tag.toUpperCase(),
  b: elementBark<HTMLElement>(pith),
  key
})
export const elmNS = (ns: string, tag: string, pith: NPith<Element>) => ({
  R: 'ElementNS',
  tag: tag.toUpperCase(),
  ns,
  b: elementBark<Element>(pith)
})

export const div = (pith: NPith<HTMLElement>) => elm('div', pith)
export const h1 = (pith: NPith<HTMLElement>) => elm('h1', pith)
export const dl = (pith: NPith<HTMLElement>) => elm('dl', pith)
export const dt = (pith: NPith<HTMLElement>) => elm('dt', pith)
export const dd = (pith: NPith<HTMLElement>) => elm('dd', pith)
export const ol = (pith: NPith<HTMLElement>) => elm('ol', pith)
export const ul = (pith: NPith<HTMLElement>) => elm('ul', pith)
export const li = (pith: NPith<HTMLElement>) => elm('li', pith)

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

elementBark(o => {
  o('Hello world!')

  o(
    h1(o => {
      o('there')
    })
  )
  o(
    ol(o => {
      o(li(o => o('a')))
      o(li(o => o('b')))
      o(li(o => o('c')))
    })
  )
  o(elmNS('', 'a', o => {}))
})(rootNode)
console.log([...rootNode.childNodes])

elementBark(o => {
  o(
    ol(o => {
      o(li(o => o('a')))
      o(li(o => o('b')))
      o(li(o => o('c')))
    })
  )
  o(elmNS('', 'a', o => {}))
  o('Hello world!')

  o(
    h1(o => {
      o('there')
    })
  )
})(rootNode)
console.log([...rootNode.childNodes])
