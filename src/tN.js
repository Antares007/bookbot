// @flow strict

export type Pith = (
  (
    | { R: 'Text', b: Text => void }
    | { R: 'Element', tag: string, b: HTMLElement => void }
    | { R: 'ElementNS', tag: string, ns: string, b: Element => void }
    | { R: 'Comment', b: Comment => void }
  ) => void
) => void

export const elm = (tag: string, pith: Pith) => ({ R: 'Element', tag, b: elementBark(pith) })
export const str = (text: string) => ({
  R: 'Text',
  b: (n: Text) => ((n.textContent = text), void 0)
})

const elementmap = new Map<Element, (Element) => void>()
const htmlmap = new Map<HTMLElement, (HTMLElement) => void>()
const textmap = new Map<Text, (Text) => void>()
const commentmap = new Map<Comment, (Comment) => void>()

const pithmap = new Map<HTMLElement, Pith>()

export function elementBark(pith: Pith): HTMLElement => void {
  return element => {
    if (pithmap.get(element) === pith) return
    pithmap.set(element, pith)
    var index = 0
    pith(r => {
      const ref: ?Node = element.childNodes[index++]
      const ns = element.childNodes
      const l = ns.length
      var i = index
      var found = null
      if (r.R === 'Text') {
        while (i < l && !found)
          if (ns[i] instanceof Text && textmap.get(ns[i]) === r.b) found = ns[i]
          else i++
        if (!found) {
          found = document.createTextNode('')
          textmap.set(found, r.b)
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) element.insertBefore(found, ref)
      } else if (r.R === 'Comment') {
        while (i < l && !found)
          if (ns[i] instanceof Comment && commentmap.get(ns[i]) === r.b) found = ns[i]
          else i++
        if (!found) {
          found = document.createComment('')
          commentmap.set(found, r.b)
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) element.insertBefore(found, ref)
      } else if (r.R === 'Element') {
        while (i < l && !found)
          if (ns[i] instanceof HTMLElement && htmlmap.get(ns[i]) === r.b) found = ns[i]
          else i++
        if (!found) {
          found = document.createElement(r.tag)
          htmlmap.set(found, r.b)
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) element.insertBefore(found, ref)
      } else {
        while (i < l && !found)
          if (ns[i] instanceof Element && elementmap.get(ns[i]) === r.b) found = ns[i]
          else i++
        if (!found) {
          found = document.createElementNS(r.ns, r.tag)
          elementmap.set(found, r.b)
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) element.insertBefore(found, ref)
      }
    })
  }
}
