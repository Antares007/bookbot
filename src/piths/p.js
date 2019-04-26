// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import { cast } from '../cast'
import { combineSS, makeStreamController } from './node'

type SS<A> = S.S<A> | A

type Reducer<S> = { type: 'reducer', r: S => S }

type Patch<N: Node> = { type: 'patch', p: N => void }

type Ref<N: Node> = { type: 'ref', value: N }

type State<S> = { type: 'state', value: S }

type P<I, Elm: Node> = (
  (SS<N<I>>) => void,
  (SS<Patch<Elm> | Reducer<I>>) => void,
  S.S<Ref<Elm> | State<I>>
) => void

type N<S> =
  | string
  | { type: 'ul', pith: P<S, HTMLUListElement> }
  | { type: 'li', pith: P<S, HTMLLIElement> }
  | { type: 'div', pith: P<S, HTMLDivElement> }
  | { type: 'button', pith: P<S, HTMLButtonElement> }

const reducer = <S>(r: S => S): Reducer<S> => ({ type: 'reducer', r })

const patch = <N: Node>(p: N => void): Patch<N> => ({ type: 'patch', p })

const ul = <S>(pith: P<S, HTMLUListElement>): N<S> => ({ type: 'ul', pith })
const li = <S>(pith: P<S, HTMLLIElement>): N<S> => ({ type: 'li', pith })
const div = <S>(pith: P<S, HTMLDivElement>): N<S> => ({ type: 'div', pith })
const button = <S>(pith: P<S, HTMLButtonElement>): N<S> => ({ type: 'button', pith })

const counter = (d: number): N<{ n: number }> =>
  div((o, p, i) => {
    p(S.d(reducer(s => s)))
    o(
      button((o, p, i) => {
        o('+')
        d > 0 && o(S.periodic(50 + d * 50).map(i => (i % 2 === 0 ? counter(d - 1) : '')))
        //d > 0 && o(counter(d - 1))
      })
    )
    o(
      button((o, p, i) => {
        o('-')
        d > 0 && o(counter(d - 1))
      })
    )
    o('0')
  })

const patches = run(div(o => o(S.d(counter(2), 1000))))

const rootNode = document.getElementById('root-node')
if (!(rootNode instanceof HTMLDivElement)) throw new Error('cant find root-node')

patches
  .map(p => (p.type === 'patch' ? p.p(rootNode) : p))
  .scan(s => s + 1, 0)
  .skip(1)
  .take(999)
  .run(console.log.bind(console))

function run<State>(n: N<State>): S.S<Reducer<State> | Patch<Node>> {
  if (typeof n === 'string') {
    return S.d(
      patch(parent => {
        parent.textContent = n
      })
    )
  }
  if (n.type === 'div')
    return S.s(o => {
      const { start, stop } = makeStreamController(o)
      const ssnodes: Array<SS<N<State>>> = []
      const prss = []
      const prs = []
      n.pith(
        v => {
          ssnodes.push(v)
        },
        v => {
          if (v instanceof S.S) {
            prss.push(v)
          } else {
            prs.push(v)
          }
        },
        S.empty()
      )

      var childPatches: Array<S.S<Reducer<State> | Patch<Node>>>
      start(
        combineSS(ssnodes).map(v => {
          if (v.type === 'init') {
            const { v: nodes } = v
            childPatches = new Array(nodes.length)
            for (var i = 0, l = nodes.length; i < l; i++)
              start((childPatches[i] = runAt(nodes[i], i)))
            for (var i = 0, l = prss.length; i < l; i++)
              start(cast(prss[i])<S.S<Reducer<State> | Patch<Node>>>())
            return patch(parent => {
              const pnodesLength = nodes.length
              const childNodes = parent.childNodes
              var li: ?Node
              for (var index = 0; index < pnodesLength; index++) {
                const x = nodes[index]
                li = null
                for (var i = index, l = childNodes.length; i < l; i++)
                  if ((li = eq(childNodes[index], x))) break
                if (li == null) parent.insertBefore(create(x), childNodes[index])
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
              if (eq(on, node)) return
              parent.insertBefore(create(node), on)
              parent.removeChild(on)
            })
          }
        })
      )
    })
  throw new Error()
}

function runAt<State>(n: N<State>, i: number): S.S<Patch<Node> | Reducer<State>> {
  return run(n).map(p =>
    p.type === 'patch'
      ? patch(parent => {
          p.p(parent.childNodes[i])
        })
      : p
  )
}

function eq<State>(n: Node, node: N<State>): ?Node {
  const TAG = typeof node === 'string' ? '#text' : node.type.toUpperCase()
  return n.nodeName === TAG ? n : null
}

function create<State>(node: N<State>): Node {
  return typeof node === 'string'
    ? document.createTextNode(node)
    : document.createElement(node.type)
}
