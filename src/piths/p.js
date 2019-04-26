// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import { cast } from '../cast'
import { combineSS, makeStreamController } from './node'

type SS<A> = S.S<A> | A

type Reducer<S> = { type: 'reducer', r: S => S }

type Patch = { type: 'patch', p: Node => void }

type P<I> = (
  { node: (SS<N<I>>) => void, patch: (SS<Patch>) => void, reduce: (SS<Reducer<I>>) => void },
  { ref: S.S<Node>, states: S.S<I> }
) => void

type N<S> =
  | { type: 'element', tag: string, pith: P<S> }
  | { type: 'text', tag: '#text', value: string }
  | { type: 'comment', tag: '#comment', value: string }

const reducer = <S>(r: S => S): Reducer<S> => ({ type: 'reducer', r })

const patch = (p: Node => void): Patch => ({ type: 'patch', p })

const elm = <S>(tag: string, pith: P<S>): N<S> => ({
  type: 'element',
  tag: tag.toUpperCase(),
  pith
})
const text = <S>(value: string): N<S> => ({ type: 'text', tag: '#text', value })
const comment = <S>(value: string): N<S> => ({ type: 'comment', tag: '#comment', value })

const counter = (d: number): N<{ n: number }> =>
  elm('div', (o, i) => {
    o.node(comment('this is the comment'))
    o.node(
      elm('button', (o, i) => {
        o.node(text('+'))
        d > 0 && o.node(counter(d - 1))
      })
    )
    o.node(
      elm('button', (o, i) => {
        o.node(text('-'))
        d > 0 && o.node(counter(d - 1))
      })
    )
    o.node(text('0'))
  })

const patches = run(elm('div', o => o.node(S.d(counter(2), 1000))))

const rootNode = document.getElementById('root-node')
if (!(rootNode instanceof HTMLDivElement)) throw new Error('cant find root-node')

patches
  .map(p => (p.type === 'patch' ? p.p(rootNode) : p))
  .scan(s => s + 1, 0)
  .skip(1)
  .take(999)
  .run(console.log.bind(console))

function run<State>(n: N<State>): S.S<Reducer<State> | Patch> {
  if (n.type !== 'element') {
    return S.d(
      patch(parent => {
        parent.textContent = n.value
      })
    )
  }
  return S.s(o => {
    const { start, stop } = makeStreamController(o)
    const ssnodes: Array<SS<N<State>>> = []
    const prss = []
    const prs = []
    n.pith(
      {
        node: v => {
          ssnodes.push(v)
        },
        patch: v => {},
        reduce: v => {}
      },
      { ref: S.empty(), states: S.empty() }
    )

    var childPatches: Array<S.S<Reducer<State> | Patch>>
    start(
      combineSS(ssnodes).map(v => {
        if (v.type === 'init') {
          const { v: nodes } = v
          childPatches = new Array(nodes.length)
          for (var i = 0, l = nodes.length; i < l; i++)
            start((childPatches[i] = runAt(nodes[i], i)))
          for (var i = 0, l = prss.length; i < l; i++) start(prss[i])
          return patch(parent => {
            const pnodesLength = nodes.length
            const childNodes = parent.childNodes
            var li: ?Node
            for (var index = 0; index < pnodesLength; index++) {
              const x = nodes[index]
              li = null
              for (var i = index, l = childNodes.length; i < l; i++)
                if ((li = childNodes[index].nodeName === x.tag ? childNodes[index] : null)) break
              if (li == null)
                parent.insertBefore(
                  x.type === 'element'
                    ? document.createElement(x.tag)
                    : x.type === 'text'
                    ? document.createTextNode(x.value)
                    : document.createComment(x.value),
                  childNodes[index]
                )
              else if (i !== index) parent.insertBefore(li, childNodes[index])
            }
            for (var i = childNodes.length - 1; i >= pnodesLength; i--)
              parent.removeChild(childNodes[i])
          })
        } else {
          const { index, v: node } = v
          const oldPatch = childPatches[index]
          start((childPatches[index] = runAt(node, index)))
          stop(oldPatch)
          return patch(parent => {
            const on = parent.childNodes[index]
            parent.insertBefore(
              node.type === 'element'
                ? document.createElement(node.tag)
                : node.type === 'text'
                ? document.createTextNode(node.value)
                : document.createComment(node.value),
              on
            )
            parent.removeChild(on)
          })
        }
      })
    )
  })
}

function runAt<State>(n: N<State>, i: number): S.S<Patch | Reducer<State>> {
  return run(n).map(p =>
    p.type === 'patch'
      ? patch(parent => {
          p.p(parent.childNodes[i])
        })
      : p
  )
}
