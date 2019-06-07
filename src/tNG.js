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
  pith: ((S.SPith<Rays>) => void, S.SPith<HTMLElement>) => void
): S.SPith<{
  R: 'ElementTree',
  tag: string,
  name: string,
  b: (HTMLElement, JSGit.Repo) => P.PPith<G.TreeHash>
}> => {
  const [po, proxy] = S.proxy()
  return S.map(
    b => ({
      R: 'ElementTree',
      tag,
      name,
      b: (e, r) => (po(e), b(e, r))
    }),
    sbark(o => {
      pith(o, proxy)
    })
  )
}
const s = sbark(o => {
  o(
    rGElement('div', 'aa', (o, pe) => {
      //      o(S.d({ R: 'Text', b: n => ((n.textContent = '+'), void 0) }))
      S.run(r => console.log(1, r), pe)
    })
  )
  o(
    S.map(
      b => ({
        R: 'ElementTree',
        tag: 'div',
        name: 'counter',
        b: (e, r) => (console.log('b'), b(e, r))
      }),
      sbark(o => {
        console.log('p>')
        o(
          S.map(
            b => ({ R: 'ElementTree', tag: 'button', name: '+', b: (e, r) => b(e, r) }),
            sbark(o => {
              o(S.d({ R: 'Text', b: n => ((n.textContent = '+'), void 0) }))
            })
          )
        )
        o(
          S.map(
            b => ({ R: 'ElementTree', tag: 'button', name: '-', b }),
            sbark(o => {
              o(S.d({ R: 'Text', b: n => ((n.textContent = '-'), void 0) }))
            })
          )
        )

        console.log('p<')
      })
    )
  )
})

const repo = JSGit.mkrepo(__dirname + '/../.git')
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

S.run(console.log.bind(console), S.map(g => g(rootNode, repo)(console.log.bind(console)), s))
