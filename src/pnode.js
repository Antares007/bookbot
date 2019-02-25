// @flow strict-local
import { S, event } from './stream'

type PNode$Pith = ((S<PNode$O> | PNode$O) => void) => void

type PNode$O =
  | { type: 'element', pith: PNode$Pith, tag: string, key?: string }
  | { type: 'text', text: string }

export const elm = (tag: string, pith: PNode$Pith, key?: string): PNode$O => ({
  type: 'element',
  tag: tag.toUpperCase(),
  pith,
  key
})
export const text = <N>(text: string): PNode$O => ({ type: 'text', text })

export function run<N: Node>(vnode: S<PNode$O> | PNode$O): S<(N) => void> {
  return vnode instanceof S ? S.switchLatest(vnode.map(p1)) : p1(vnode)
}

function p1<N: Node>(vnode: PNode$O): S<(N) => void> {
  if (vnode.type === 'text')
    return S.at(parent => {
      if (parent.textContent !== vnode.text) parent.textContent = vnode.text
    })
  const patches: Array<S<(N) => void>> = []
  var i = 0
  vnode.pith(vnode => {
    patches.push(
      vnode instanceof S
        ? S.switchLatest(vnode.map(vnode => p2(i++, vnode)))
        : p2(i++, vnode)
    )
  })
  patches.push(
    S.at(parent => {
      for (var j = parent.childNodes.length - 1; j >= i; j--) {
        console.log('rm')
        parent.removeChild(parent.childNodes[j])
      }
    })
  )
  return combinePatches(patches)
}

function p2<N: Node>(index: number, vnode: PNode$O): S<(N) => void> {
  return p1(vnode).map(p => parent => {
    var li: ?N
    if (vnode.type === 'text') {
      li = parent.childNodes[index]
      if (li == null || li.nodeName !== '#text')
        li = parent.insertBefore(document.createTextNode(''), li)
      return p(li)
    }
    for (var j = index, l = parent.childNodes.length; j < l; j++) {
      li = parent.childNodes[j]
      if (
        li.nodeName === vnode.tag &&
        li instanceof HTMLElement &&
        li.dataset.key == vnode.key
      )
        break
      li = null
    }
    if (li == null) {
      li = parent.insertBefore(
        document.createElement(vnode.tag),
        parent.childNodes[index]
      )
      vnode.key && (li.dataset.key = vnode.key)
    } else if (j !== index) parent.insertBefore(li, parent.childNodes[index])
    p(li)
  })
}

function combinePatches<N>(array: Array<S<(N) => void>>): S<(N) => void> {
  return new S((o, schdlr) => {
    const dmap = new Map()
    var mas: Array<?Array<(N) => void>> = array.map(
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
          var as: Array<Array<(N) => void>> = []
          for (var a of mas) {
            if (a == null) return
            as.push(a)
          }
          mas = array.map(_ => [])
          o(event(e.t, a => as.forEach(b => b.forEach(p => p(a)))))
        } else if (e.type === 'end') {
          dmap.delete(index)
          if (dmap.size === 0) o(e)
        } else o(e)
      }
    }
  })
}
