// @flow strict-local
import type { On } from './on'
import { mkOn } from './on'
import { S } from './stream'
import * as stream from './stream'
import { defaultScheduler } from './scheduler'

type Pith<A: Node> = ((O<A>) => void, A) => void
type O<A> =
  | { type: 'element', s: S<Pith<A>>, tag: string }
  | { type: 'text', s: S<string> }

const elm = <A>(tag: string, s_: Pith<A>): O<A> => ({
  type: 'element',
  tag: tag.toUpperCase(),
  s: S.at(s_)
})
const text = <A>(s_: string): O<A> => ({ type: 'text', s: S.at(s_) })
const selm = <A>(tag: string, s: S<Pith<A>>): O<A> => ({
  type: 'element',
  tag: tag.toUpperCase(),
  s
})
const stext = <A>(s: S<string>): O<A> => ({ type: 'text', s })

const btn = label =>
  elm('button', (o, n) => {
    o(text(label))
  })

const btnInc = btn('+')
const btnDec = btn('-')
const div = selm(
  'div',
  S.periodic(1000)
    .skip(1)
    .scan(a => a + 1, 0)
    .skip(1)
    .take(19)
    .map(nn => (nn % 3) + 1)
    .map(nn => (o, n: HTMLElement) => {
      o(btnInc)
      o(btnDec)
    })
    .sum(
      S.at(o => {
        o(text('loading...'))
      })
    )
)

function run<A: Node>(elm: A, v: O<A>): S<() => void> {
  if (v.type === 'text')
    return v.s.map(str => () => {
      elm.textContent = str
    })
  const s = v.s.multicast()
  var limap = new Map()
  return s.flatMap(pith => {
    var i = 0
    const childs = elm.childNodes
    const newlimap = new Map()
    const patches: Array<S<() => void>> = []
    pith(vi => {
      const index = i++
      var li: ?A = null
      if (vi.type === 'text') {
        li = childs[index]
        if (li == null || li.nodeName !== '#text')
          li = elm.insertBefore(document.createTextNode(''), li)
        patches.push(run(li, vi))
      } else if (vi.type === 'element') {
        for (var j = index, l = childs.length; j < l; j++)
          if ((li = childs[j]) && limap.get(li) === vi) break
          else li = null
        if (li == null)
          li = elm.insertBefore(document.createElement(vi.tag), childs[index])
        else if (j !== index) elm.insertBefore(li, childs[index])
        newlimap.set(li, vi)
        patches.push(run(li, vi))
      }
    }, elm)
    limap = newlimap
    return S.combine(
      (...patches) => () => {
        patches.forEach(p => p())
        for (var j = childs.length - 1; j >= i; j--)
          console.log('rm', elm.removeChild(childs[j]))
      },
      ...patches.map(p => p)
    ).until(s)
  })
}

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

run(rootNode, div).map(p => p())
//  .run(console.log.bind(console), defaultScheduler)

const numbers = S.periodic(1000)
  .scan(a => a + 1, 0)
  .multicast()
const clicks = mkOn(window)('click')
const v = S.periodic(400)
  .skip(1)
  .scan(a => a + 1, 0)
  .skip(1)
  .multicast()
numbers.flatMap(e => v.until(numbers))
//.run(console.log.bind(console), defaultScheduler)
