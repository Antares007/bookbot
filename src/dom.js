// @flow strict-local
import type { O as SO } from './stream'
import type { On } from './on'
import { mkOn } from './on'
import { S } from './stream'
import * as stream from './stream'
import { Scheduler } from './scheduler'

type Pith = ((O) => void, On) => void
type O =
  | { type: 'element', s: S<Pith>, tag: string }
  | { type: 'text', s: S<string> }
  | { type: 'attr', s: S<{ [string]: string }> }
  | { type: 'style', s: S<{ [string]: string }> }

const elm = (tag: string, s_: Pith): O => ({
  type: 'element',
  tag: tag.toUpperCase(),
  s: S.at(s_)
})
const text = (s_: string): O => ({ type: 'text', s: S.at(s_) })
const attr = (s_: { [string]: string }): O => ({
  type: 'attr',
  s: S.at(s_)
})
const style = (s_: { [string]: string }): O => ({
  type: 'style',
  s: S.at(s_)
})

const selm = (tag: string, s: S<Pith>): O => ({
  type: 'element',
  tag: tag.toUpperCase(),
  s
})
const stext = (s: S<string>): O => ({ type: 'text', s })
const sattr = (s: S<{ [string]: string }>): O => ({ type: 'attr', s })
const sstyle = (s: S<{ [string]: string }>): O => ({ type: 'style', s })

const numbers = S.periodic(1000)
  .scan(a => a + 1, 0)
  .multicast()

numbers
  .until(numbers.skip(1))
  .run(console.log.bind(console), Scheduler.default())

const div = elm('div', (o, on) => {
  const actionStreams = []
  o(style({ background: 'blue' }))
  o(
    elm('button', (o, on) => {
      o(text('+'))
      actionStreams.push(on('click').map(() => +1))
    })
  )
  o(
    elm('button', (o, on) => {
      o(text('-'))
      actionStreams.push(on('click').map(() => -1))
    })
  )
  const rez = S.fromArray(actionStreams)
    .flatMap(a => a)
    .map(n => n + '')
  o(text('rez'))
})

function run(elm: HTMLElement, v: O): S<() => void> {
  if (v.type === 'text') {
    return v.s.map(str => () => {
      elm.textContent = str
    })
  } else if (v.type === 'attr') {
    return v.s.map(map => () => {
      for (var key in map) elm.setAttribute(key, map[key])
    })
  } else if (v.type === 'style') {
    return v.s.map(map => () => {
      const style = elm.style
      for (var key in map) style.setProperty(key, map[key])
    })
  } else {
    const s = v.s.multicast()
    var omap = new Map()
    return s.flatMap(pith => {
      const childs = elm.children
      const len = childs.length
      const nmap = new Map()
      var i = 0
      var patch = S.at(() => {
        while (i < len) elm.removeChild(childs[i])
      })
      pith(vi => {
        if (vi.type === 'text' || vi.type === 'element') {
          const index = i++
          var li: ?HTMLElement = null
          var j = index
          const tag = vi.type === 'element' ? vi.tag : 'SPAN'
          while (j < len && li == null) {
            li = childs[j++]
            if (li.tagName !== tag || omap.get(li) !== vi.s) li = null
          }
          if (li == null) {
            li = document.createElement(tag)
            nmap.set(li, vi.s)
            elm.insertBefore(li, childs[index])
          } else {
            nmap.set(li, vi.s)
            if (j - 1 !== index) elm.insertBefore(li, childs[index])
          }
          patch = run(li, vi)
            .product(patch)
            .map(([a, b]) => () => {
              b()
              a()
            })
        } else {
        }
      }, mkOn(elm))
      omap = nmap
      return patch.until(s.skip(1))
    })
  }
}
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
console.log(rootNode)
run(rootNode, div).map(p => {
  console.log('patched', p.toString())
  p()
})
//.run(console.log.bind(console), Scheduler.default())
