// @flow strict-local
import type { Disposable } from './disposable'
import { S, event, end, empty } from './stream'
import { defaultScheduler } from './scheduler'
import { mkOn } from './on'

type Pith<A> = ((S<O<A>> | O<A>) => void, A) => void

type O<A> =
  | { type: 'element', pith: Pith<A>, tag: string, key?: string }
  | { type: 'text', text: string }
type Patch = () => void

const elm = <A>(tag: string, pith: Pith<A>, key?: string): O<A> => ({
  type: 'element',
  tag: tag.toUpperCase(),
  pith,
  key
})
const text = <A>(text: string): O<A> => ({ type: 'text', text })

const counter = d =>
  elm('div', (o, n) => {
    const on = mkOn(n)
    o(
      elm('button', o => {
        o(text('+'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      elm('button', o => {
        o(text('-'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      on('click')
        .map(e => (e.target instanceof Node ? e.target.textContent[0] : ''))
        .map(str => (str === '+' ? 1 : str === '-' ? -1 : 0))
        .scan((a, b) => a + b, 0)
        .map(n => text(n + ''))
    )
  })
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
run(
  rootNode,
  S.periodic(1000)
    .scan(a => a + 1, 0)
    .map(n => counter(n % 3))
)
  .map(p => p())
  .run(console.log.bind(console), defaultScheduler)

function run<A: Node>(elm: A, vnode: S<O<A>> | O<A>): S<Patch> {
  return vnode instanceof S
    ? S.switchLatest(vnode.map(vnode => patchParent(elm, vnode)))
    : patchParent(elm, vnode)
}

function patchParent<A: Node>(parent: A, vnode: O<A>) {
  if (vnode.type === 'text')
    return S.at(() => {
      if (parent.textContent !== vnode.text) parent.textContent = vnode.text
    })
  const patches: Array<S<Patch>> = []
  var i = 0
  const newlimap = new Map()
  vnode.pith(vnode => {
    const index = i++
    const patch =
      vnode instanceof S
        ? S.switchLatest(vnode.map(vnode => patchChild(parent, index, vnode)))
        : patchChild(parent, index, vnode)
    patches.push(patch)
  }, parent)
  patches.push(
    S.at(() => {
      for (var j = parent.childNodes.length - 1; j >= i; j--) {
        console.log('rm')
        parent.removeChild(parent.childNodes[j])
      }
    })
  )
  return combinePatches(
    patches => () => {
      var p
      for (var ps of patches) while ((p = ps.shift())) p()
    },
    patches
  )
}

function patchChild<A: Node>(parent: A, index: number, vnode: O<A>) {
  var li: ?A
  if (vnode.type === 'text') {
    li = parent.childNodes[index]
    if (li == null || li.nodeName !== '#text')
      li = parent.insertBefore(document.createTextNode(''), li)
    return run(li, vnode)
  }
  for (var j = index, l = parent.childNodes.length; j < l; j++) {
    li = parent.childNodes[j]
    if (
      li.nodeName === vnode.tag &&
      (li instanceof HTMLElement && li.dataset.key == vnode.key)
    ) {
      break
    } else li = null
  }
  if (li == null) {
    li = parent.insertBefore(
      document.createElement(vnode.tag),
      parent.childNodes[index]
    )
    vnode.key && (li.dataset.key = vnode.key)
  } else if (j !== index) parent.insertBefore(li, parent.childNodes[index])
  return run(li, vnode)
}
function groupPatches(s: S<Patch>): S<Patch> {
  return new S((o, schdlr) => {
    var es = []
    var d = null
    return s.f(e => {
      if (e.type === 'event') {
        if (d == null)
          d = schdlr.delay(0, t => {
            d = null
            const patches = es
            es = []
            o(
              event(t, () => {
                patches.forEach(p => p())
              })
            )
          })
        es.push(e.v)
      } else o(e)
    }, schdlr)
  })
}
function combinePatches<A, B>(
  f: (Array<Array<A>>) => B,
  array: Array<S<A>>
): S<B> {
  return new S((o, schdlr) => {
    const dmap = new Map()
    const mas: Array<?Array<A>> = array.map(
      (s, i) => (dmap.set(i, s.f(ring(i), schdlr)), null)
    )
    return {
      dispose() {
        dmap.forEach(d => d.dispose())
      }
    }
    function ring(index) {
      return e => {
        if (e.type === 'event') {
          if (mas[index] == null) mas[index] = [e.v]
          else mas[index].push(e.v)
          var as: Array<Array<A>> = []
          for (var a of mas) {
            if (a == null) return
            as.push(a)
          }
          o(event(e.t, f(as)))
        } else if (e.type === 'end') {
          dmap.delete(index)
          if (dmap.size === 0) o(e)
        } else o(e)
      }
    }
  })
}
