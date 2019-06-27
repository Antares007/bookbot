// @flow strict
import * as N from './N'
import * as G from './G'
import * as P from './P'
import * as S from './S'
import * as M from './M'
import { liftBark } from './liftbark'

export type Rays =
  | N.RNode
  | G.Rays
  | {
      R: 'nodeTree',
      create: () => Node,
      eq: Node => boolean,
      name: string,
      b: (Node, G.Repo, ?G.Hash) => P.CBPith<G.Hash>
    }

export type Pith = ((Rays) => void, Node, G.Tree) => void

export function nodeGitBark(pith: Pith): (Node, G.Repo, ?G.Hash) => P.CBPith<G.Hash> {
  return (n, repo, initHash) =>
    G.treeBark((oG, tree) =>
      N.nodeBark((oN, n) =>
        pith(
          r => {
            if (r.R === 'nodeTree') {
              oN({
                R: 'node',
                create: r.create,
                eq: r.eq,
                b: n => {
                  const p = r.b(n, repo, tree[r.name] ? tree[r.name].hash : null)
                  oG({ R: 'tree', name: r.name, b: () => p })
                }
              })
            } else if (r.R === 'node') oN(r)
            else oG(r)
          },
          n,
          tree
        )
      )(n)
    )(repo, initHash)
}

const sbark = liftBark<Rays, *, *, *>(nodeGitBark)

const gelm = (
  tag: string,
  name: string,
  pith: ((S.SPith<Rays> | Rays) => void, S.SPith<Node>, S.SPith<*>) => void
): S.SPith<{
  R: 'nodeTree',
  create: () => Node,
  eq: Node => boolean,
  name: string,
  b: (Node, G.Repo, ?G.Hash) => P.CBPith<G.Hash>
}> => {
  const TAG = tag.toUpperCase()
  return S.map(
    b => ({
      R: 'nodeTree',
      create: () => document.createElement(TAG),
      eq: n => n.nodeName === TAG,
      name,
      b: M.m3(b)
    }),
    sbark(pith)
  )
}

const str = (text: string) => ({
  R: 'node',
  create: () => document.createTextNode(text),
  eq: n => n.nodeName === '#text' && n.textContent === text,
  b: n => {}
})

const rblob = (name: string, f: (?Buffer) => Buffer): G.Rays => ({
  R: 'blob',
  name,
  b: M.m2((r, h) =>
    h ? P.flatMap(b => repo.saveBlob(f(b)), repo.loadBlob(h)) : repo.saveBlob(f())
  )
})

const [stateO, state] = S.proxy()
var i = 0
const counter = (depth: number, state: S.SPith<G.Hash>) =>
  gelm('div', 'counter', (o, c, d) => {
    const f = b => Buffer.from('a')
    const p1 = S.proxy()
    const p2 = S.proxy()
    o(p1[1])
    o(p2[1])
    o(
      gelm('button', '+', (o, c, d) => {
        const on = new S.On(c)
        S.run(
          p1[0],
          S.map(() => rblob('hi', b => Buffer.from('a' + i++)), S.merge(S.d(), on.click()))
        )
        o(S.d(str('+')))
        depth > 0 && o(counter(depth - 1, state))
      })
    )
    o(
      gelm('button', '-', (o, c, d) => {
        const on = new S.On(c)
        S.run(p2[0], S.map(() => rblob('hi', b => Buffer.from('a')), S.merge(S.d(), on.click())))
        o(S.d(str('-')))
        depth > 0 && o(counter(depth - 1, state))
      })
    )
  })

const s = sbark(o => o(counter(1, state)))

const repo = G.mkrepo(__dirname + '/../.git')
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

const d = S.run(r => {
  if (r.T === 'next') {
    r.value(e => {
      if (e.T === 'right') {
        console.log(e.value)
      } else console.error(e.value)
    })
  } else r.T === 'error' ? console.error(r.error) : console.info(r.T)
}, S.map(g => g(rootNode, repo), s))
