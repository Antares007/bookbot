// @flow strict

export type Pith = (
  (
    | { R: 'Text', b: Text => void }
    | { R: 'Element', tag: string, b: HTMLElement => void }
    | { R: 'ElementNS', tag: string, ns: string, b: Element => void }
    | { R: 'Comment', b: Comment => void }
  ) => void
) => void

const elementmap = new Map<Element, (Element) => void>()
const htmlmap = new Map<HTMLElement, (HTMLElement) => void>()
const textmap = new Map<Text, (Text) => void>()
const commentmap = new Map<Comment, (Comment) => void>()

const pithmap = new Map<HTMLElement, Pith>()

function elementBark(pith: Pith): HTMLElement => void {
  return element => {
    if (pithmap.get(element) === pith) return
    pithmap.set(element, pith)
    var index = 0
    pith(r => {
      const ref: ?Node = element.childNodes[index++]
      if (r.R === 'Text') {
        let found = null
        let i = index
        for (let l = element.childNodes.length; i < l; i++) {
          const n = element.childNodes[i]
          if (n instanceof Text && textmap.get(n) === r.b) {
            found = n
            break
          }
        }
        if (found) {
          if (i !== index) element.insertBefore(found, ref)
        } else {
          found = document.createTextNode('')
          r.b(element.insertBefore(found, ref))
          textmap.set(found, r.b)
        }
      } else if (r.R === 'Comment') {
        let found = null
        let i = index
        for (let l = element.childNodes.length; i < l; i++) {
          const n = element.childNodes[i]
          if (n instanceof Comment && commentmap.get(n) === r.b) {
            found = n
            break
          }
        }
        if (found) {
          if (i !== index) element.insertBefore(found, ref)
        } else {
          found = document.createComment('')
          r.b(element.insertBefore(found, ref))
          commentmap.set(found, r.b)
        }
      } else if (r.R === 'Element') {
        let found = null
        let i = index
        for (let l = element.childNodes.length; i < l; i++) {
          const n = element.childNodes[i]
          if (n instanceof HTMLElement && htmlmap.get(n) === r.b) {
            found = n
            break
          }
        }
        if (found) {
          if (i !== index) element.insertBefore(found, ref)
        } else {
          found = document.createElement(r.tag)
          r.b(element.insertBefore(found, ref))
          htmlmap.set(found, r.b)
        }
      } else {
        r
      }
    })
  }
}
