// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import { cast } from '../cast'
import { combineSS, makeStreamController } from './node'

type SS<A> = S.S<A> | A

type Reducer<S> = { type: 'reducer', r: S => S }

type Patch = { type: 'patch', p: Node => void }

type P<I> = (
  {
    node: (SS<N<I>>) => void,
    patch: (SS<(Node) => void>) => void,
    reduce: (SS<(I) => I>) => void
  },
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
        const on = new S.On(i.ref)
        o.reduce(on.click().map(_ => s => ({ ...s, n: s.n + 1 })))
        o.node(text('+'))
      })
    )
    o.node(
      elm('button', (o, i) => {
        const on = new S.On(i.ref)
        o.reduce(on.click().map(_ => s => ({ ...s, n: s.n - 1 })))
        o.node(text('-'))
      })
    )
    o.node(i.states.map(s => text(s.n + '')))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const states = runO(rootNode, { n: 0, b: true }, counter(0))
states.run(console.log.bind(console))

function runO<State>(elm: Node, initState: State, n: N<State>): S.S<State> {
  return S.s(o => {
    var state = initState
    const statesO = []
    const states = S.s(o => {
      statesO.push(o)
      o(
        D.create(() => {
          const pos = statesO.indexOf(o)
          if (pos >= 0) statesO.splice(pos, 1)
        })
      )
      o(
        S.delay(() => {
          o(S.next(state))
        })
      )
    })
    o(
      runI(states, n)
        .filter2(p => (p.type === 'patch' ? p.p(rootNode) : p))
        .run(e => {
          if (e instanceof S.Next) {
            state = e.value.r(state)
            const nextState = S.next(state)
            o(nextState)
            statesO.forEach(o => o(S.delay(() => o(nextState))))
          } else o(e)
        })
    )
  })
}

function runI<State>(states: S.S<State>, n: N<State>): S.S<Reducer<State> | Patch> {
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
    const patchess = []
    const patches = []
    const reducerss = []
    const reducers = []
    var refO = _ => {}
    const ref = S.s(o => {
      refO = o
    }).multicast()

    n.pith(
      {
        node: v => {
          ssnodes.push(v)
        },
        patch: v => {
          if (v instanceof S.S) patchess.push(v)
          else patches.push(v)
        },
        reduce: v => {
          if (v instanceof S.S) reducerss.push(v)
          else reducers.push(v)
        }
      },
      {
        ref,
        states
      }
    )

    var childPatches: Array<S.S<Reducer<State> | Patch>>
    start(
      combineSS(ssnodes).map(v => {
        if (v.type === 'init') {
          const { v: nodes } = v
          childPatches = new Array(nodes.length)

          for (var i = 0, l = nodes.length; i < l; i++)
            start((childPatches[i] = runAt(states, nodes[i], i)))

          for (var i = 0, l = patchess.length; i < l; i++) start(patchess[i].map(x => patch(x)))

          if (reducers.length > 0)
            start(
              S.d(
                reducer(s => {
                  var s_ = s
                  for (var i = 0, l = reducers.length; i < l; i++) s_ = reducers[i](s_)
                  return s_
                })
              )
            )

          for (var i = 0, l = reducerss.length; i < l; i++) start(reducerss[i].map(x => reducer(x)))

          return patch(parent => {
            mkInitPatch(nodes, parent)
            for (var i = 0, l = patches.length; i < l; i++) patches[i](parent)
            refO(S.next(parent))
          })
        } else {
          const { index, v: node } = v
          const oldPatch = childPatches[index]
          start((childPatches[index] = runAt(states, node, index)))
          stop(oldPatch)
          return patch(mkUpdatePatch(node, index))
        }
      })
    )
  })
}

function mkUpdatePatch(node, index) {
  return parent => {
    const on = parent.childNodes[index]
    parent.insertBefore(create(node), on)
    parent.removeChild(on)
  }
}

function mkInitPatch(nodes, parent) {
  const pnodesLength = nodes.length
  const childNodes = parent.childNodes
  var li: ?Node
  for (var index = 0; index < pnodesLength; index++) {
    const x = nodes[index]
    li = null
    for (var i = index, l = childNodes.length; i < l; i++)
      if ((li = childNodes[index].nodeName === x.tag ? childNodes[index] : null)) break
    if (li == null) parent.insertBefore(create(x), childNodes[index])
    else if (i !== index) parent.insertBefore(li, childNodes[index])
  }
  for (var i = childNodes.length - 1; i >= pnodesLength; i--) parent.removeChild(childNodes[i])
}

function runAt<State>(states: S.S<State>, n: N<State>, i: number): S.S<Patch | Reducer<State>> {
  return runI(states, n).map(p =>
    p.type === 'patch'
      ? patch(parent => {
          p.p(parent.childNodes[i])
        })
      : p
  )
}

function create(x) {
  return x.type === 'element'
    ? document.createElement(x.tag)
    : x.type === 'text'
    ? document.createTextNode(x.value)
    : document.createComment(x.value)
}
