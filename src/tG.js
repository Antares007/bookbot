// @flow strict
import * as S from './tS'
import * as JSGit from './js-git'
import * as P from './tP'

export type Tree = {
  [string]:
    | { mode: 'blob' | 'file' | 'exec' | 'sym', hash: BlobHash }
    | { mode: 'tree', hash: TreeHash }
    | { mode: 'commit', hash: CommitHash }
}
export type Commit = {
  tree: TreeHash,
  parents: Array<CommitHash>,
  author: { name: string, email: string, date: { seconds: number, offset: number } },
  commiter: { name: string, email: string, date: { seconds: number, offset: number } },
  message: string
}

export opaque type CommitHash = string
export opaque type BlobHash = string
export opaque type TreeHash = string

export type Rays =
  | { R: 'blob', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
  | { R: 'file', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
  | { R: 'exec', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
  | { R: 'sym', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
  | { R: 'tree', name: string, b: JSGit.Repo => P.PPith<TreeHash> }
  | { R: 'commit', name: string, b: JSGit.Repo => P.PPith<CommitHash> }

export type Pith = ((Rays) => void) => void

export function treeBark(pith: Pith): JSGit.Repo => P.PPith<TreeHash> {
  return repo => {
    const entries: Array<{ name: string, mode: JSGit.Mode }> = []
    const hashes: Array<P.PPith<BlobHash | CommitHash | TreeHash>> = []
    try {
      pith(r => {
        entries.push({ name: r.name, mode: repo.modes[r.R] })
        hashes.push(r.b(repo))
      })
    } catch (error) {
      return P.reject(error)
    }
    return P.flatMap(hashes => {
      const tree: JSGit.Tree = {}
      for (var i = 0; i < hashes.length; i++)
        tree[entries[i].name] = { mode: entries[i].mode, hash: hashes[i] }
      return P.p(o => {
        repo.saveAs('tree', tree, (error, hash) => {
          if (error) o(P.rError(error))
          else o(P.rValue(hash))
        })
      })
    }, P.all(hashes))
  }
}

const blob = (name: string, data: Buffer) => ({
  R: 'blob',
  name,
  b: repo =>
    P.p(o => repo.saveAs('blob', data, (err, hash) => o(err ? P.rError(err) : P.rValue(hash))))
})
const tree = (name: string, pith: Pith) => ({
  R: 'tree',
  name,
  b: treeBark(pith)
})
