// @flow strict
import * as N from './N'
import * as G from './G'
import * as P from './P'
import * as S from './S'
import * as M from './memoize'
import { liftBark } from './liftbark'

export type Rays =
  | N.RNode
  | G.Rays
  | {
      R: 'nodeTree',
      create: () => Node,
      eq: Node => boolean,
      name?: string,
      b: (Node, G.Repo, ?G.Hash) => P.PPith<G.Hash>
    }

export type Pith = (
  (Rays) => void,
  Node,
  { [string]: 'tree' | 'blob' | 'exec' | 'sym' | 'commit' }
) => void

export function nodeGitBark(pith: Pith): (Node, G.Repo, ?G.Hash) => P.PPith<G.Hash> {
  return (n, repo, initHash) => {
    const ps = []
    const phash = G.treeBark((oG, dir) =>
      N.nodeBark((oN, n) =>
        pith(
          r => {
            if (r.R === 'nodeTree') {
              oN({
                R: 'node',
                create: r.create,
                eq: r.eq,
                b: n => {
                  const p = r.b(n, repo, initHash)
                  console.log(r.name)
                  if (r.name) oG({ R: 'tree', name: r.name, b: () => p })
                  else ps.push(p)
                }
              })
            } else if (r.R === 'node') oN(r)
            else oG(r)
          },
          n,
          dir
        )
      )(n)
    )(repo, initHash)

    if (ps.length === 0) return phash
    ps.push(phash)
    return P.flatMap((forest: Array<?G.Tree>) => {
      var tree: G.Tree = {}
      for (var t of forest) tree = Object.assign(tree, t)
      return repo.saveTree(tree)
    }, P.all(ps.map(p => P.flatMap(h => repo.loadTree(h), p))))
  }
}

const sbark = liftBark<Rays, *, *, *>(nodeGitBark)

const gelm = (
  tag: string,
  pith: ((S.SPith<Rays> | Rays) => void, S.SPith<Node>, S.SPith<*>) => void,
  name?: string
): S.SPith<{
  R: 'nodeTree',
  create: () => Node,
  eq: Node => boolean,
  name?: string,
  b: (Node, G.Repo, ?G.Hash) => P.PPith<G.Hash>
}> => {
  const TAG = tag.toUpperCase()
  return S.map(
    b => ({
      R: 'nodeTree',
      create: () => document.createElement(TAG),
      eq: n => n.nodeName === TAG,
      name,
      b: b
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

const [stateO, state] = S.proxy()
var i = 0
const counter = (depth: number, key: string, state: S.SPith<G.Hash>) =>
  gelm(
    'div',
    (o, c, d) => {
      //const on = new S.On(S.tap(console.log.bind(console, 'elm'), c))
      //o(
      //  S.map(
      //    e => ({
      //      R: 'blob',
      //      name: 's.json',
      //      b: M.memoize2((repo, hash) => repo.saveBlob(Buffer.from(i++ + '')))
      //    }),
      //    S.merge(on.click(), S.d(null))
      //  )
      //)
      o({ R: 'blob', name: 'file.txt', b: r => r.saveBlob(Buffer.from('hi\n')) })
      o(
        gelm('button', (o, c, d) => {
          o(S.d(str('+')))
          depth > 0 && o(counter(depth - 1, key + '+', state))
        })
      )
      o(
        gelm('button', (o, c, d) => {
          o(S.d(str('-')))
          depth > 0 && o(counter(depth - 1, key + '-', state))
        })
      )
    },
    key
  )

const s = sbark(o => o(counter(2, 'counter', state)))

const repo = G.mkrepo(__dirname + '/../.git')
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

const d = S.run(r => {
  if (r.T === 'next') {
    r.value(e => {
      if (e.R === 'value') {
        console.log(e.value)
      } else console.error(e.error)
    })
  } else r.T === 'error' ? console.error(r.error) : console.info(r.T)
}, S.map(g => g(rootNode, repo), s))
