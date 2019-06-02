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

export type Pith = (
  (
    | { R: 'blob', name: string, b: JSGit.Repo => Promise<BlobHash> }
    | { R: 'file', name: string, b: JSGit.Repo => Promise<BlobHash> }
    | { R: 'exec', name: string, b: JSGit.Repo => Promise<BlobHash> }
    | { R: 'sym', name: string, b: JSGit.Repo => Promise<BlobHash> }
    | { R: 'tree', name: string, b: JSGit.Repo => Promise<TreeHash> }
    | { R: 'commit', name: string, b: JSGit.Repo => Promise<CommitHash> }
  ) => void
) => void

export function treeBark(pith: Pith): JSGit.Repo => Promise<TreeHash> {
  return repo =>
    Promise.resolve(pith).then(pith => {
      const entries = []
      const hashes = []
      pith(r => {
        entries.push({ name: r.name, mode: repo.modes[r.R] })
        hashes.push(r.b(repo))
      })
      if (entries.length === 0) return '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
      return Promise.all(hashes).then(hashes => {
        const tree: JSGit.Tree = {}
        for (var i = 0; i < hashes.length; i++)
          tree[entries[i].name] = { mode: entries[i].mode, hash: hashes[i] }
        return new Promise((resolve, reject) => {
          repo.saveAs('tree', tree, (err, hash) => {
            if (err) reject(err)
            else resolve(hash)
          })
        })
      })
    })
}

const blob = (name: string, data: Buffer) => ({
  R: 'blob',
  name,
  b: repo =>
    new Promise((resolve, reject) => {
      repo.saveAs('blob', data, (err, hash) => {
        if (err) reject(err)
        else resolve(hash)
      })
    })
})
const tree = (name: string, pith: Pith) => ({
  R: 'tree',
  name,
  b: treeBark(pith)
})

treeBark(o => {
  o(blob('file1.txt', Buffer.from('a')))
  o(tree('folder', o => {}))
})(JSGit.mkrepo(__dirname + '/../.git')).then(
  console.log.bind(console),
  console.error.bind(console)
)
