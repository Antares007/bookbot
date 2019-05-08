// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import type { SS } from './streamstaff'
import { ssmap } from './streamstaff'

export type NORay = {
  (SS<N>): void,
  patch: (SS<(Node) => void>) => void
}
export type NIRay = { ref: S.S<Node> }
export type NPith = (NORay, NIRay) => void

export type N =
  | { type: 'element', tag: string, pith: NPith, key?: string }
  | { type: 'elementNS', tag: string, pith: NPith, ns: string }
  | { type: 'text', tag: '#text', value: string }
  | { type: 'comment', tag: '#comment', value: string }

export const elm = (tag: string, pith: NPith, key?: string): N => ({
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
      return S.s(runPith(n.pith))
    default:
      throw new Error('never')
  }
}

function runPith(pith) {
  return o => {
    const dmap = new Map()
    o(D.create(() => dmap.forEach(d => d.dispose())))

    const [refO, ref] = S.proxy()
    const patches: Array<(Node) => void> = []

    const mergeO = makeMergeO(o)

    var i = 0
    const ns: Array<[number, N]> = []
    pith(
      Object.assign(
        ss => {
          const index = i++
          const map = (n: N) => {
            const at = index
            const ap = findAppendPosition(at, ns)
            var li = ns[ap]
            if (ap === -1 || li[0] !== at) {
              li = [at, n]
              ns.splice(ap + 1, 0, li)
            }
            return (node: Node) => {}
          }
          const stop = mergeO(ss instanceof S.S ? ss.map(n => map(n)) : map(ss))
        },
        {
          patch: ms => {
            mergeO(ms)
          }
        }
      ),
      { ref }
    )

    //    const ssnodes: Array<SS<N>> = []
    //    const patchess = []
    //    const patches = []
    //    var i = 0
    //    pith(
    //      Object.assign(
    //        v => {
    //          const index = i++
    //          ssnodes.push(v)
    //        },
    //        {
    //          patch: v => {
    //            if (v instanceof S.S) patchess.push(v)
    //            else patches.push(v)
    //          }
    //        }
    //      ),
    //      { ref }
    //    )
    //
    //    var childPatches: Array<S.S<(Node) => void>>
    //    var childNodes: Array<N>
    //    start(
    //      combineSS(
    //        nodes => {
    //          childNodes = nodes
    //          childPatches = new Array(nodes.length)
    //
    //          for (var i = 0, l = nodes.length; i < l; i++)
    //            start((childPatches[i] = runOn(nodes[i], i)))
    //
    //          for (var i = 0, l = patchess.length; i < l; i++) start(patchess[i])
    //
    //          return parent => {
    //            const pnodesLength = nodes.length
    //            const childNodes = parent.childNodes
    //            var li: ?Node
    //            for (var index = 0; index < pnodesLength; index++) {
    //              const x = nodes[index]
    //              li = null
    //              for (var i = index, l = childNodes.length; i < l; i++)
    //                if ((li = eq(childNodes[i], x))) break
    //              if (li == null) parent.insertBefore(create(x), childNodes[index])
    //              else if (i !== index) parent.insertBefore(li, childNodes[index])
    //            }
    //            for (var i = childNodes.length - 1; i >= pnodesLength; i--)
    //              console.log('rm', parent.removeChild(childNodes[i]))
    //            for (var i = 0, l = patches.length; i < l; i++) patches[i](parent)
    //            refO(parent)
    //          }
    //        },
    //        (node, index) => {
    //          const oldPatch = childPatches[index]
    //          start((childPatches[index] = runOn(node, index)))
    //          stop(oldPatch)
    //          const oldNode = childNodes[index]
    //          if (oldNode.tag !== node.tag || (node.key && oldNode.key !== node.key)) {
    //            childNodes[index] = node
    //            return parent => {
    //              const on = parent.childNodes[index]
    //              if (eq(on, node)) return
    //              parent.insertBefore(create(node), on)
    //              console.log('rm_', parent.removeChild(on))
    //            }
    //          } else return null
    //        },
    //        ssnodes
    //      ).filterJust(x => x)
    //    )
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

function combineSS<A, B>(
  initF: (Array<A>) => B,
  updateF: (A, number) => B,
  array: Array<SS<A>>
): S.S<B> {
  return S.s(o => {
    const dmap = new Map()
    const as: Array<A> = new Array(array.length)
    const idxs = []
    o(D.create(() => dmap.forEach(d => d.dispose())))
    for (let index = 0, l = array.length; index < l; index++) {
      const a = array[index]
      if (a instanceof S.S) {
        idxs.push(index)
        dmap.set(
          index,
          S.run(e => {
            if (e instanceof S.Next) {
              if (idxs.length === 0) o(S.next(updateF(e.value, index)))
              else {
                as[index] = e.value
                const pos = idxs.indexOf(index)
                if (pos !== -1) idxs.splice(pos, 1)
                if (idxs.length === 0) o(S.next(initF(as)))
              }
            } else if (e instanceof S.End) {
              dmap.delete(index)
              if (dmap.size === 0) o(e)
            } else o(e)
          }, a)
        )
      } else as[index] = a
    }
    if (idxs.length === 0) {
      o(
        S.delay(() => {
          o(S.next(initF(as)))
          o(S.delay(() => o(S.end)))
        })
      )
    }
  })
}

export function findAppendPosition<T>(n: number, line: Array<[number, T]>): number {
  var l = 0
  var r = line.length
  while (true) {
    if (l < r) {
      const m = ~~((l + r) / 2) | 0
      if (line[m][0] > n) {
        r = m
        continue
      } else {
        l = m + 1
        continue
      }
    } else {
      return l - 1
    }
  }
  throw new Error('never')
}

function makeMergeO<A>(
  o: (S.Next<A> | S.End | Error | D.Disposable) => void
): (S.S<A> | A) => ?D.Disposable {
  const dmap = new Map()
  o(D.create(() => dmap.forEach(d => d.dispose())))
  return x => {
    var d =
      x instanceof S.S
        ? x.run(e => {
            if (e instanceof S.End) {
              dmap.delete(x)
              if (dmap.size === 0) o(e)
            } else o(e)
          })
        : S.delay(() => {
            dmap.delete(x)
            if (dmap.size === 0) o((d = S.delay(() => o(S.end))))
            o(S.next(x))
          })
    return dmap
      .set(
        x,
        D.create(() => {
          dmap.delete(x)
          d.dispose()
        })
      )
      .get(x)
  }
}
