// @flow strict

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

import * as JSGit from './js-git'
import * as P from './tP'

export type Pith = (
  (
    | { R: 'blob', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
    | { R: 'file', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
    | { R: 'exec', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
    | { R: 'sym', name: string, b: JSGit.Repo => P.PPith<BlobHash> }
    | { R: 'tree', name: string, b: JSGit.Repo => P.PPith<TreeHash> }
    | { R: 'commit', name: string, b: JSGit.Repo => P.PPith<CommitHash> }
  ) => void
) => void

export function treeBark(pith: Pith): JSGit.Repo => P.PPith<BlobHash> {
  return repo =>
    P.flatMap(
      ([entries, hashes]) => {
        return P.flatMap(hashes => {
          const tree: JSGit.Tree = {}
          for (var i = 0; i < hashes.length; i++)
            tree[entries[i].name] = { mode: entries[i].mode, hash: hashes[i] }
          return P.p(o => {
            repo.saveAs('tree', tree, (error, hash) => {
              if (error) o(P.reject(error))
              else o(P.resolve(hash))
            })
          })
        }, P.all(hashes))
      },
      P.p(o => {
        const entries: Array<{ name: string, mode: JSGit.Mode }> = []
        const hashes: Array<P.PPith<BlobHash | CommitHash | TreeHash>> = []
        pith(r => {
          entries.push({ name: r.name, mode: repo.modes[r.R] })
          hashes.push(r.b(repo))
        })
        o(P.resolve([entries, hashes]))
      })
    )
}
import * as S from './tS'

function bmap<R, B>(
  bark: (((R) => void) => void) => B
): (((S.SPith<R>) => void) => void) => S.SPith<B> {
  return pith =>
    S.flatMap(pith => {
      const rays: Array<S.SPith<R>> = []

      pith(r => {
        rays.push(r)
      })

      return S.combine(
        (...rays) =>
          bark(o => {
            for (var r of rays) o(r)
          }),
        ...rays
      )
    }, S.d(pith))
}

//export const see = bmap<
//  $Call<<R>(((R) => void) => void) => R, Pith>,
//  (JSGit.Repo) => Promise<TreeHash>
//>(treeBark)
//
const blob = (name: string, data: Buffer) => ({
  R: 'blob',
  name,
  b: repo =>
    P.p(o => repo.saveAs('blob', data, (err, hash) => o(err ? P.reject(err) : P.resolve(hash))))
})
const tree = (name: string, pith: Pith) => ({
  R: 'tree',
  name,
  b: treeBark(pith)
})

const s = treeBark(o => {
  o(blob('file1.txt', Buffer.from('a')))
  o(tree('folder', o => {}))
})(JSGit.mkrepo(__dirname + '/../.git'))(console.log.bind(console))
