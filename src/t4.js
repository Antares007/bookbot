// @flow strict
import * as S from './t'
import { binarySearchRightmost } from './S/scheduler'
import * as D from './S/Disposable'
import type { Pith } from './pith'

export type SS<+A> = S.S<A> | A

export type NORay = { T: 'patch', s: S.S<(Node) => void> } | { T: 'node', s: S.S<N> }

export type NIRay = { ref: S.S<Node> }

export opaque type R: { R: 'patch', r: Node => void } = { R: 'patch', r: Node => void }

export opaque type NElement = {
  T: 'element',
  tag: string,
  s: HTMLElement => D.Disposable,
  key: ?string
}
export opaque type NElementNS = {
  T: 'elementNS',
  tag: string,
  s: Element => D.Disposable,
  ns: string
}
export opaque type NText = { T: 'text', tag: '#text', s: Text => D.Disposable }
export opaque type NComment = { T: 'comment', tag: '#comment', s: Comment => D.Disposable }
export type N = NElement | NElementNS | NText | NComment

export type NPith = Pith<NORay, NIRay, void>

export const patch = (s: S.S<(Node) => void>): NORay => ({ T: 'patch', s })
export const node = (ss: SS<N>): NORay => ({
  T: 'node',
  s: ss.T === 's' ? ss : S.d(ss)
})
export const elm = (tag: string, pith: NPith, key?: string): N => ({
  T: 'element',
  tag: tag.toUpperCase(),
  s: elementBark(pith),
  key
})
export const elmNS = (ns: string, tag: string, pith: NPith): N => ({
  T: 'elementNS',
  tag: tag.toUpperCase(),
  s: elementBark(pith),
  ns
})
export const text = (ss: SS<string>): N => ({
  T: 'text',
  tag: '#text',
  s: characterDataBark(typeof ss === 'string' ? S.d(ss) : ss)
})
export const comment = (ss: SS<string>): N => ({
  T: 'comment',
  tag: '#comment',
  s: characterDataBark(typeof ss === 'string' ? S.d(ss) : ss)
})

export function characterDataBark<T: CharacterData>(s: S.S<string>): T => D.Disposable {
  return charData =>
    S.run(r => {
      if (r.T === 'end') return
      const text = r.T === 'next' ? r.value : r.error.message
      charData.textContent !== text && (charData.textContent = text)
    }, s)
}

export function elementBark<Elm: Element>(pith: NPith): Elm => D.Disposable {
  return elm => {
    const indices: Array<number> = []
    var nds: Array<D.Disposable>
    const nrays: Array<S.S<boolean>> = []
    const prays: Array<S.S<void>> = []

    const ns = []
    var nLength = 0

    const find = <B>(f: Node => ?B, fromIndex: number, array: NodeList<Node>): ?B => {
      for (var i = fromIndex, l = array.length; i < l; i++) {
        const mb = f(array[i])
        if (mb) return mb
      }
    }

    pith(
      r => {
        if (r.T === 'node') {
          const nIndex = nLength++
          nrays.push(
            S.map(n => {
              var pos = binarySearchRightmost(nIndex, indices)
              if (pos === -1 || indices[pos] < nIndex) indices.splice(++pos, 0, nIndex)
              const childatpos = elm.childNodes[pos]
              const d = nds[nIndex]
              d && d.dispose()
              var child
              var ret = false

              switch (n.T) {
                case 'element':
                  child = find(
                    elm =>
                      elm instanceof HTMLElement &&
                      elm.nodeName === n.tag &&
                      n.key == elm.dataset.key
                        ? elm
                        : null,
                    pos,
                    elm.childNodes
                  )
                  if (!child) {
                    child = document.createElement(n.tag)
                    n.key && (child.dataset.key = n.key)
                  }
                  nds[nIndex] = n.s(elm.insertBefore(child, childatpos))
                  break
                case 'elementNS':
                  break
                case 'text':
                  child = find(node => (node instanceof Text ? node : null), pos, elm.childNodes)
                  nds[nIndex] = n.s(
                    child
                      ? elm.insertBefore(child, childatpos)
                      : elm.insertBefore(document.createTextNode('loading...'), childatpos)
                  )
                  break
                case 'comment':
                  break
                default:
                  throw new Error(`case [${n.T}] not covered`)
              }
              return child !== childatpos
            }, r.s)
          )
        } else {
          prays.push(S.map(p => p(elm), r.s))
        }
      },
      { ref: S.empty }
    )
    nds = new Array(nLength)

    const nraysd = S.run(r => {
      if (r.T === 'error') return console.error(r.error)
      //else if (r.T === 'next')
      //  S.delay(() => {
      //    for (var i = elm.childNodes.length - 1; i >= indices.length; i--)
      //      console.log('rm', elm.removeChild(elm.childNodes[i]))
      //  })
    }, S.merge(...nrays))

    const praysd = S.run(r => {
      if (r.T === 'error') return console.error(r.error)
    }, S.merge(...prays))

    return D.create(() => {
      nds.forEach(d => d && d.dispose())
      nraysd.dispose()
      praysd.dispose()
    })
  }
}

const eqn = (function eq(node, n) {
  //if (n.T === 'Element' && node instanceof HTMLElement) return node
  return null
  //if (node == null) return false
  //if (node.nodeName !== n.tag) return false
  //if (n.T === 'element' && node instanceof HTMLElement && n.key && node.dataset.key !== n.key)
  //  return false
  //return true
}: {
  (?Node, n: NElement): ?HTMLElement,
  (?Node, n: NElementNS): ?Element,
  (?Node, n: NText): ?Text,
  (?Node, n: NComment): ?Comment
})

function eq(node: ?Node, n: N): ?Node {
  return node == null
    ? node
    : node.nodeName !== n.tag ||
      (n.T === 'element' && n.key && node instanceof HTMLElement && node.dataset.key !== n.key)
    ? null
    : node
}

function create(n: N): Node {
  switch (n.T) {
    case 'element':
      const elm = document.createElement(n.tag)
      if (n.key) elm.dataset.key = n.key
      return elm
    case 'elementNS':
      return document.createElementNS(n.ns, n.tag)
    case 'text':
      return document.createTextNode('')
    case 'comment':
      return document.createComment('')
    default:
      throw new Error('never')
  }
}
