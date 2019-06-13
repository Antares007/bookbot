// @flow strict
import * as N from './tN'
import * as G from './tG'
import * as P from './tP'
import * as S from './tS'

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
export type Pith = ((Rays) => void) => void

export function bark(pith: Pith): (HTMLElement, G.Repo, ?G.Hash) => P.PPith<G.Hash> {
  return (element, repo, initHash) => {
    const nrays: Array<N.Rays> = []
    const grays: Array<G.Rays> = []
    const ps: Array<P.PPith<G.Hash>> = []
    pith(r => {
      switch (r.R) {
        case 'Text':
        case 'Element':
        case 'ElementNS':
        case 'Comment':
          nrays.push(r)
          break
        case 'ElementTree':
          nrays.push({
            R: 'Element',
            tag: r.tag,
            b: element => {
              const p = r.b(element, repo, initHash)
              if (r.name) grays.push({ R: 'tree', name: r.name, b: () => p })
              else ps.push(p)
            }
          })
          break
        case 'ElementNSTree':
          nrays.push({
            R: 'ElementNS',
            tag: r.tag,
            ns: r.ns,
            b: element => {
              const p = r.b(element, repo, initHash)
              if (r.name) grays.push({ R: 'tree', name: r.name, b: () => p })
              else ps.push(p)
            }
          })
          break
        default:
          grays.push((r: G.Rays))
          break
      }
    })

    if (nrays.length) N.elementBark(o => nrays.forEach(o))(element)
    if (grays.length) ps.push(G.treeBark(o => grays.forEach(o))(repo))
    if (ps.length === 0) return P.resolve(G.emptyTreeHash)
    if (ps.length === 1) return ps[0]
    return P.flatMap((forest: Array<?G.Tree>) => {
      var tree: G.Tree = {}
      for (var t of forest) tree = Object.assign(tree, t)
      return repo.saveTree(tree)
    }, P.all(ps.map(p => P.flatMap(h => repo.loadTree(h), p))))
  }
}

function bmap<R: {}, B>(
  bark: (((R) => void) => void) => B
): (((S.SPith<R> | R) => void) => void) => S.SPith<B> {
  return pith =>
    S.flatMap(pith => {
      const rays: Array<S.SPith<R>> = []
      pith(r => {
        rays.push(typeof r === 'object' ? S.d(r) : r)
      })
      if (rays.length === 0) return S.d(bark(o => {}))
      return S.combine(
        (...rays) =>
          bark(o => {
            for (var r of rays) o(r)
          }),
        ...rays
      )
    }, S.d(pith))
}

const sbark = bmap<Rays, *, *, *>(bark)

const gelm = (
  tag: string,
  pith: ((S.SPith<Rays> | Rays) => void, S.On) => void,
  name?: string
): S.SPith<{
  R: 'ElementTree',
  tag: string,
  name?: string,
  b: (HTMLElement, G.Repo, ?G.Hash) => P.PPith<G.Hash>
}> => {
  const [proxyO, proxy] = S.proxy()
  return S.map(
    b => ({
      R: 'ElementTree',
      tag,
      name,
      b: (e, r, i) => {
        proxyO(e)
        return b(e, r, i)
      }
    }),
    sbark(o => {
      pith(o, new S.On(proxy))
    })
  )
}

const [stateO, state] = S.proxy()

const counter = (depth: number, key: string, state: S.SPith<G.Hash>) =>
  gelm(
    'div',
    (o, on) => {
      o({ R: 'blob', name: 'file.txt', b: r => r.saveBlob(Buffer.from('hi\n')) })
      o(
        gelm('button', (o, on) => {
          o(S.d(N.str('+')))
          depth > 0 && o(counter(depth - 1, key + '+', state))
          o({
            R: 'blob',
            name: 'file2',
            b: r => r.saveBlob(Buffer.from(JSON.stringify({ n: 0 })))
          })
        })
      )
      o(
        gelm('button', (o, on) => {
          o(S.d(N.str('-')))
          S.map(a => a, on.click())
          depth > 0 && o(counter(depth - 1, key + '-', state))
        })
      )
      //S.map(hash => P.map(a => a, repo.loadTree(hash)), state)
    },
    key
  )

stateO(G.emptyTreeHash)
const s = sbark(o => o(counter(2, 'counter', state)))

const repo = G.mkrepo(__dirname + '/../.git')
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

const d = S.run(r => {
  if (r.T === 'next') {
    r.value(e => {
      if (e.R === 'value') {
        console.log(e.value)
        stateO(e.value)
      } else console.error(e.error)
    })
  } else r.T === 'error' ? console.error(r.error) : console.info(r.T)
}, S.map(g => g(rootNode, repo), s))
