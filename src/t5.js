// @flow strict
import * as S from './t'
import { binarySearchRightmost } from './S/scheduler'
import * as D from './S/Disposable'
import type { Pith } from './pith'

export type SS<+A> = S.S<A> | A
export opaque type B<N: Element> = (N) => void

export type NPith<N: Element> = Pith<
  | ({ R: 'Element', tag: string } & B<HTMLElement>)
  | string
  | number
  | boolean
  | Date
  | {}
  | Array<string | number | boolean | Date | {}>,
  N,
  void
>

const elm = (tag, pith) => Object.assign(elementBark(pith), { tag })
const div = pith => elm('div', pith)
const h1 = pith => elm('h1', pith)
const dl = pith => elm('dl', pith)
const dt = pith => elm('dt', pith)
const dd = pith => elm('dd', pith)
const ol = pith => elm('ol', pith)
const ul = pith => elm('ul', pith)
const li = pith => elm('li', pith)

function elementBark<N: Element>(pith: NPith<N>): B<N> {
  return element => {
    pith(r => {
      if (typeof r === 'string') {
        element.appendChild(document.createTextNode(r))
      } else if (typeof r === 'number') {
        const span = element.appendChild(document.createElement('span'))
        span.className = 'number'
        span.innerText = r + ''
      } else if (typeof r === 'boolean') {
        const span = element.appendChild(document.createElement('span'))
        span.className = 'boolean'
        span.innerText = JSON.stringify(r)
      } else if (r instanceof Date) {
        const span = element.appendChild(document.createElement('span'))
        span.className = 'date'
        span.innerText = r.toISOString()
      } else if (Array.isArray(r)) {
        const ul = element.appendChild(document.createElement('ul'))
        ul.className = 'array'
        elementBark(o => r.forEach(v => o(li(o => o(v)))))(ul)
      } else if (typeof r === 'object') {
        const dl = element.appendChild(document.createElement('dl'))
        dl.className = 'object'
        elementBark(o =>
          Object.keys(r).forEach(key => {
            o(dt(o => o(key)))
            o(dd(o => o(r[key])))
          })
        )(dl)
      } else {
        r(element.appendChild(document.createElement(r.tag)))
      }
    }, element)
  }
}

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
})(rootNode)
