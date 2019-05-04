// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import { combineSS, makeStreamController } from './streamstaff'
import type { SS } from './streamstaff'

export type NORay = {
  (SS<N>): void,
  patch: (SS<(Node) => void>) => void
}
export type NIRay = { ref: S.S<Node> }
export type NPith = (NORay, NIRay) => void

export type N =
  | { type: 'element', tag: string, pith: NPith, key: ?string }
  | { type: 'elementNS', tag: string, pith: NPith, ns: string }
  | { type: 'text', tag: '#text', value: string }
  | { type: 'comment', tag: '#comment', value: string }

export const elm = (tag: string, pith: NPith, key?: ?string): N => ({
  type: 'element',
  tag: tag.toUpperCase(),
  pith,
  key
})
export const elmNS = (ns: string, tag: string, pith: NPith): N => ({
  type: 'elementNS',
  tag: tag.toUpperCase(),
  pith,
  ns
})
export const text = (value: string): N => ({ type: 'text', tag: '#text', value })
export const comment = (value: string): N => ({ type: 'comment', tag: '#comment', value })

export function run(n: N): S.S<(Node) => void> {
  switch (n.type) {
    case 'text':
    case 'comment':
      return S.d(parent => {
        if (parent.textContent !== n.value) parent.textContent = n.value
      })
    case 'element':
    case 'elementNS':
      return S.s(o => {
        const { start, stop } = makeStreamController(o)
        const ssnodes: Array<SS<N>> = []
        const patchess = []
        const patches = []
        const [refO, ref] = proxy()
        n.pith(
          Object.assign(
            v => {
              ssnodes.push(v)
            },
            {
              patch: v => {
                if (v instanceof S.S) patchess.push(v)
                else patches.push(v)
              }
            }
          ),
          { ref }
        )

        var childPatches: Array<S.S<(Node) => void>>
        start(
          combineSS(ssnodes).map(v => {
            if (v.type === 'init') {
              const { v: nodes } = v
              childPatches = new Array(nodes.length)

              for (var i = 0, l = nodes.length; i < l; i++)
                start((childPatches[i] = runOn(nodes[i], i)))

              for (var i = 0, l = patchess.length; i < l; i++) start(patchess[i])

              return parent => {
                const pnodesLength = nodes.length
                const childNodes = parent.childNodes
                var li: ?Node
                for (var index = 0; index < pnodesLength; index++) {
                  const x = nodes[index]
                  li = null
                  for (var i = index, l = childNodes.length; i < l; i++)
                    if ((li = eq(childNodes[i], x))) break
                  if (li == null) parent.insertBefore(create(x), childNodes[index])
                  else if (i !== index) parent.insertBefore(li, childNodes[index])
                }
                for (var i = childNodes.length - 1; i >= pnodesLength; i--)
                  console.log('rm', parent.removeChild(childNodes[i]))
                for (var i = 0, l = patches.length; i < l; i++) patches[i](parent)
                refO(parent)
              }
            } else {
              const { index, v: node } = v
              const oldPatch = childPatches[index]
              start((childPatches[index] = runOn(node, index)))
              stop(oldPatch)
              return parent => {
                const on = parent.childNodes[index]
                if (eq(on, node)) return
                parent.insertBefore(create(node), on)
                console.log('rm_', parent.removeChild(on))
              }
            }
          })
        )
      })
    default:
      throw new Error('never')
  }
}

function runOn(n: N, i: number): S.S<(Node) => void> {
  return run(n).map(p => parent => p(parent.childNodes[i]))
}

function eq(node: Node, n): ?Node {
  return node.nodeName !== n.tag ||
    (n.type === 'element' && n.key && node instanceof HTMLElement && node.dataset.key !== n.key)
    ? null
    : node
}

function create(n: N): Node {
  switch (n.type) {
    case 'element':
      const elm = document.createElement(n.tag)
      if (n.key) elm.dataset.key = n.key
      return elm
    case 'elementNS':
      return document.createElementNS(n.ns, n.tag)
    case 'text':
      return document.createTextNode(n.value)
    case 'comment':
      return document.createComment(n.value)
    default:
      throw new Error('never')
  }
}

function proxy<A>(): [(A) => void, S.S<A>] {
  const os = []
  var lastA: ?A
  const o = a => {
    lastA = a
    os.forEach(o => o(S.delay(() => o(S.next(a)))))
  }
  const s = S.s(o => {
    os.push(o)
    o(
      D.create(() => {
        const pos = os.indexOf(o)
        if (pos >= 0) os.splice(pos, 1)
      })
    )
    if (lastA) {
      const nextA = S.next(lastA)
      o(S.delay(() => o(nextA)))
    }
  })
  return [o, s]
}
