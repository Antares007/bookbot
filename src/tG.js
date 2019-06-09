// @flow strict
import * as S from './tS'
import * as JSGit from './js-git'
import * as P from './tP'

export type Rays =
  | { R: '40000', name: string, b: JSGit.Repo => P.PPith<JSGit.TreeHash> }
  | { R: '160000', name: string, b: JSGit.Repo => P.PPith<JSGit.CommitHash> }
  | { R: '100644', name: string, b: JSGit.Repo => P.PPith<JSGit.BlobHash> }
  | { R: '100755', name: string, b: JSGit.Repo => P.PPith<JSGit.BlobHash> }
  | { R: '120000', name: string, b: JSGit.Repo => P.PPith<JSGit.BlobHash> }

export type Pith = ((Rays) => void) => void

export function treeBark(pith: Pith): JSGit.Repo => P.PPith<JSGit.TreeHash> {
  return repo => {
    const rays: Array<Rays> = []
    try {
      pith(r => {
        rays.push(r)
      })
    } catch (error) {
      return P.reject(error)
    }
    if (rays.length === 0) return P.resolve(JSGit.emptyTreeHash)
    return P.flatMap(hashes => {
      const tree = {}
      for (var i = 0, l = hashes.length; i < l; i++)
        tree[rays[i].name] = { mode: rays[i].R, hash: hashes[i] }
      return repo.saveTree(tree)
    }, P.all(rays.map(r => r.b(repo))))
  }
}

export function rTreeBark(pith: Pith, init: JSGit.TreeHash): JSGit.Repo => P.PPith<JSGit.TreeHash> {
  return treeBark(o => {
    pith(r => {
      o(r)
    })
  })
}

const blob = (name: string, data: Buffer) => ({
  R: '100644',
  name,
  b: repo =>
    P.p(o => repo.saveAs('blob', data, (err, hash) => o(err ? P.rError(err) : P.rValue(hash))))
})
const tree = (name: string, pith: Pith) => ({
  R: '40000',
  name,
  b: treeBark(pith)
})
