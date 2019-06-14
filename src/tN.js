// @flow strict

export type Rays =
  | { R: 'Text', b: Text => void }
  | { R: 'Element', tag: string, b: HTMLElement => void }
  | { R: 'ElementNS', tag: string, ns: string, b: Element => void }
  | { R: 'Comment', b: Comment => void }
export type Pith<N: Element> = ((Rays) => void, N) => void

export const elm = (tag: string, pith: Pith<HTMLElement>) => ({
  R: 'Element',
  tag,
  b: elementBark(pith)
})
export const str = (text: string) => ({
  R: 'Text',
  b: (n: Text) => ((n.textContent = text), void 0)
})

//const elementmap = new Map<Element, (Element) => void>()
//const htmlmap = new Map<HTMLElement, (HTMLElement) => void>()
//const textmap = new Map<Text, (Text) => void>()
//const commentmap = new Map<Comment, (Comment) => void>()
//
//const pithmap = new Map<HTMLElement, Pith>()

export function elementBark(pith: Pith<HTMLElement>): HTMLElement => void {
  return element => {
    var index = 0
    pith(r => {
      const ref: ?Node = element.childNodes[index++]
      const ns = element.childNodes
      const l = ns.length
      var i = index
      var found = null
      if (r.R === 'Text') {
        while (i < l && !found)
          if (ns[i] instanceof Text) found = ns[i]
          else i++
        if (!found) {
          found = document.createTextNode('')
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) r.b(element.insertBefore(found, ref))
      } else if (r.R === 'Comment') {
        while (i < l && !found)
          if (ns[i] instanceof Comment) found = ns[i]
          else i++
        if (!found) {
          found = document.createComment('')
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) r.b(element.insertBefore(found, ref))
      } else if (r.R === 'Element') {
        while (i < l && !found)
          if (ns[i] instanceof HTMLElement) found = ns[i]
          else i++
        if (!found) {
          found = document.createElement(r.tag)
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) r.b(element.insertBefore(found, ref))
      } else {
        while (i < l && !found)
          if (ns[i] instanceof Element) found = ns[i]
          else i++
        if (!found) {
          found = document.createElementNS(r.ns, r.tag)
          r.b(element.insertBefore(found, ref))
        } else if (i !== index) r.b(element.insertBefore(found, ref))
      }
    }, element)
    for (var i = element.childNodes.length - 1; i >= index; i--)
      element.removeChild(element.childNodes[i])
  }
}
