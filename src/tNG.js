// @flow strict
import * as N from './tN'
import * as G from './tG'
import * as P from './tP'
import * as S from './tS'
import * as JSGit from './js-git'

export type Rays =
  | N.Rays
  | G.Rays
  | {
      R: 'ElementTree',
      tag: string,
      name: string,
      b: (HTMLElement, JSGit.Repo) => P.PPith<G.TreeHash>
    }
  | {
      R: 'ElementNSTree',
      tag: string,
      ns: string,
      name: string,
      b: (Element, JSGit.Repo) => P.PPith<G.TreeHash>
    }
export type Pith = ((Rays) => void) => void

export function bark(pith: Pith): (HTMLElement, JSGit.Repo) => P.PPith<G.TreeHash> {
  return (element, repo) => {
    const nrays: Array<N.Rays> = []
    const grays: Array<G.Rays> = []
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
              const p = r.b(element, repo)
              grays.push({ R: 'tree', name: r.name, b: () => p })
            }
          })
          break
        case 'ElementNSTree':
          nrays.push({
            R: 'ElementNS',
            tag: r.tag,
            ns: r.ns,
            b: element => {
              const p = r.b(element, repo)
              grays.push({ R: 'tree', name: r.name, b: () => p })
            }
          })
          break
        default:
          grays.push((r: G.Rays))
          break
      }
    })
    N.elementBark(o => nrays.forEach(o))(element)
    return G.treeBark(o => grays.forEach(o))(repo)
  }
}

function bmap<R, B>(
  bark: (((R) => void) => void) => B
): (((S.SPith<R>) => void) => void) => S.SPith<B> {
  return pith =>
    S.flatMap(pith => {
      const rays: Array<S.SPith<R>> = []

      pith(r => {
        rays.push(r)
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

const sbark = bmap<Rays, *>(bark)

const rGElement = (
  tag: string,
  name: string,
  initTree: JSGit.Repo => P.PPith<G.TreeHash>,
  pith: ((S.SPith<Rays>) => void, S.On) => void
): S.SPith<{
  R: 'ElementTree',
  tag: string,
  name: string,
  b: (HTMLElement, JSGit.Repo) => P.PPith<G.TreeHash>
}> => {
  const [proxyO, proxy] = S.proxy()
  return S.map(
    b => ({
      R: 'ElementTree',
      tag,
      name,
      b: (e, r) => {
        proxyO(e)
        return b(e, r)
      }
    }),
    sbark(o => {
      pith(o, new S.On(proxy))
    })
  )
}

const s = sbark(o => {
  o(
    rGElement('div', 'counter', G.treeBark(o => {}), (o, on) => {
      o(
        rGElement('button', '+', G.treeBark(o => {}), (o, on) => {
          o(S.d(N.str('+')))
        })
      )
      o(
        rGElement('button', '-', G.treeBark(o => {}), (o, on) => {
          o(S.d(N.str('-')))
        })
      )
    })
  )
})

const repo = JSGit.mkrepo(__dirname + '/../.git')
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

S.run(console.log.bind(console), S.map(g => g(rootNode, repo)(console.log.bind(console)), s))
