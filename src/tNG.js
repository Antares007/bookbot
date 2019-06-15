// @flow strict
import * as N from './tN'
import * as G from './tG'
import * as P from './tP'
import * as S from './tS'
import { liftBark } from './liftbark'

export type Rays =
  | N.Rays
  | G.Rays
  | {
      R: 'ElementTree',
      tag: string,
      name?: string,
      b: (HTMLElement, G.Repo, ?G.Hash) => P.PPith<G.Hash>
    }
  | {
      R: 'ElementNSTree',
      tag: string,
      ns: string,
      name?: string,
      b: (Element, G.Repo, ?G.Hash) => P.PPith<G.Hash>
    }

export type Pith<N: Element> = (
  (Rays) => void,
  N,
  { [string]: 'tree' | 'blob' | 'exec' | 'sym' | 'commit' }
) => void

export function bark(pith: Pith<HTMLElement>): (HTMLElement, G.Repo, ?G.Hash) => P.PPith<G.Hash> {
  return (element, repo, initHash) => {
    const ps: Array<P.PPith<G.Hash>> = []
    let phash = G.treeBark((gO, dir) =>
      N.elementBark((nO, element) =>
        pith(
          r => {
            switch (r.R) {
              case 'Text':
              case 'Element':
              case 'ElementNS':
              case 'Comment':
                nO(r)
                break
              case 'ElementTree':
                nO({
                  R: 'Element',
                  tag: r.tag,
                  b: element => {
                    const p = r.b(element, repo, initHash)
                    if (r.name) gO({ R: 'tree', name: r.name, b: () => p })
                    else ps.push(p)
                  }
                })
                break
              case 'ElementNSTree':
                nO({
                  R: 'ElementNS',
                  tag: r.tag,
                  ns: r.ns,
                  b: element => {
                    const p = r.b(element, repo, initHash)
                    if (r.name) gO({ R: 'tree', name: r.name, b: () => p })
                    else ps.push(p)
                  }
                })
                break
              default:
                gO(r)
                break
            }
          },
          element,
          dir
        )
      )(element)
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

const sbark = liftBark<Rays, *, *, *>(bark)

const gelm = (
  tag: string,
  pith: ((S.SPith<Rays> | Rays) => void, S.SPith<*>, S.SPith<*>) => void,
  name?: string
): S.SPith<{
  R: 'ElementTree',
  tag: string,
  name?: string,
  b: (HTMLElement, G.Repo, ?G.Hash) => P.PPith<G.Hash>
}> => {
  return S.map(b => ({ R: 'ElementTree', tag, name, b }), sbark(pith))
}

const [stateO, state] = S.proxy()
var i = 0
const counter = (depth: number, key: string, state: S.SPith<G.Hash>) =>
  gelm(
    'div',
    (o, c, d) => {
      const on = new S.On(S.tap(console.log.bind(console, 'elm'), c))

      o(
        S.map(
          e => ({
            R: 'blob',
            name: 's.json',
            b: (repo, hash) => repo.saveBlob(Buffer.from(i++ + ''))
          }),
          S.merge(on.click(), S.d(null))
        )
      )
      o({ R: 'blob', name: 'file.txt', b: r => r.saveBlob(Buffer.from('hi\n')) })
      o(
        gelm('button', (o, c, d) => {
          o(S.d(N.str('+')))
          depth > 0 && o(counter(depth - 1, key + '+', state))
        })
      )
      o(
        gelm('button', (o, c, d) => {
          o(S.d(N.str('-')))
          depth > 0 && o(counter(depth - 1, key + '-', state))
        })
      )
    },
    key
  )

const s = sbark(o => o(counter(1, 'counter', state)))

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
