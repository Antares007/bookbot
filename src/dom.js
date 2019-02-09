// @flow strict-local
import type { O as SO } from './stream'
import type { On } from './on'
import { mkOn } from './on'
import { S } from './stream'
import * as stream from './stream'
import { defaultScheduler } from './scheduler'

type Pith = ((O) => void, On) => void
type O =
  | { type: 'element', s: S<Pith>, tag: string }
  | { type: 'text', s: S<string> }
  | { type: 'attr', s: S<{ [string]: string }> }
  | { type: 'style', s: S<{ [string]: string }> }

const elm = (tag: string, s_: Pith): O => ({
  type: 'element',
  tag: tag.toUpperCase(),
  s: stream.at(s_)
})
const text = (s_: string): O => ({ type: 'text', s: stream.at(s_) })
const attr = (s_: { [string]: string }): O => ({
  type: 'attr',
  s: stream.at(s_)
})
const style = (s_: { [string]: string }): O => ({
  type: 'style',
  s: stream.at(s_)
})

const selm = (tag: string, s: S<Pith>): O => ({
  type: 'element',
  tag: tag.toUpperCase(),
  s
})
const stext = (s: S<string>): O => ({ type: 'text', s })
const sattr = (s: S<{ [string]: string }>): O => ({ type: 'attr', s })
const sstyle = (s: S<{ [string]: string }>): O => ({ type: 'style', s })

const numbers = stream.scan(a => a + 1, 0, stream.periodic(10))

stream.take(100, numbers).run(console.log.bind(console), defaultScheduler)

const div = elm('div', (o, on) => {
  const actionStreams = []
  o(style({ background: 'blue' }))
  o(
    elm('button', (o, on) => {
      o(text('+'))
      actionStreams.push(stream.map(() => +1, on('click')))
    })
  )
  o(
    elm('button', (o, on) => {
      o(text('-'))
      actionStreams.push(stream.map(() => -1, on('click')))
    })
  )
  const rez = stream.map(
    n => n + '',
    stream.join(stream.fromArray(actionStreams))
  )
  o(stext(rez))
})

function run(elm: HTMLElement, v: O): S<(void) => void> {
  if (v.type === 'element') {
    return stream.Of((o, schedule) => {
      var d
      var ecount
      const ds = []
      d = v.s.run(epith => {
        if (epith.type !== 'event') return o(epith)
        epith.v(velm => {
          if (velm.type === 'element') {
            velm.s
          }
        }, mkOn(elm))
      }, schedule)
      ds.push(d)
      return {
        dispose() {
          for (let d of ds) d.dispose()
        }
      }
    })
    // return stream.map(pith => {
    //   return elm => {
    //     var i = 0
    //     const patchs: Array<
    //       S<(HTMLElement & { '@patch': number }) => void>
    //     > = []
    //     pith(vi => {
    //       const children = elm.children
    //       var li: ?HTMLElement
    //       if (vi.type === 'element') {
    //         for (var i = 0, l = children.length; i < l; i++)
    //           if (children[i].tagName === vi.tag) {
    //             li = children[i]
    //             break
    //           }

    //         const see = run(vi)
    //       }
    //     }, mkOn(elm))
    //   }
    // }, v.s)
  }
  if (v.type === 'text') {
    return stream.at(elm => {})
  }
  return stream.at(elm => {})
  // const p =
  //   v.type === 'text'
  //     ? str => ((elm.textContent = str), void 0)
  //     : v.type === 'attr'
  //     ? str => (elm.setAttribute(v.name, str), void 0)
  //     : str => (elm.style.setProperty(v.name, str), void 0)
  // return v.s instanceof S
  //   ? s.map(str => p.bind(null, str), v.s)
  //   : p.bind(null, v.s)
  // case 'element':
  //   return act(pith => {
  //     var i = 0
  //     pith(v => {
  //       const index = i++
  //       const li = elm.children[i]
  //       if (li.tagName === v.tag) {
  //       }
  //     }, mkOn(elm))
  //     return
  //   }, v.pith)
}
