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
export type Repo = {
  loadBlob(string): P.PPith<Buffer>,
  loadTree(string): P.PPith<Tree>,
  loadCommit(string): P.PPith<Commit>,
  saveBlob(Buffer): P.PPith<BlobHash>,
  saveTree(Tree): P.PPith<TreeHash>,
  saveCommit(Commit): P.PPith<CommitHash>
}

export opaque type CommitHash: string = string
export opaque type BlobHash: string = string
export opaque type TreeHash: string = string

export type Rays =
  | { R: 'blob', name: string, b: Repo => P.PPith<BlobHash> }
  | { R: 'file', name: string, b: Repo => P.PPith<BlobHash> }
  | { R: 'exec', name: string, b: Repo => P.PPith<BlobHash> }
  | { R: 'sym', name: string, b: Repo => P.PPith<BlobHash> }
  | { R: 'tree', name: string, b: Repo => P.PPith<TreeHash> }
  | { R: 'commit', name: string, b: Repo => P.PPith<CommitHash> }

export type Pith = ((Rays) => void) => void

export const emptyTreeHash: TreeHash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

export function treeBark(pith: Pith): Repo => P.PPith<TreeHash> {
  return repo => {
    const rays: Array<Rays> = []
    try {
      pith(r => {
        rays.push(r)
      })
    } catch (error) {
      return P.reject(error)
    }
    if (rays.length === 0) return P.resolve(emptyTreeHash)
    return P.flatMap(hashes => {
      const tree = {}
      for (var i = 0, l = hashes.length; i < l; i++)
        tree[rays[i].name] = { mode: rays[i].R, hash: hashes[i] }
      return repo.saveTree(tree)
    }, P.all(rays.map(r => r.b(repo))))
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

export function makeRepo(gitDir: string): Repo {
  const repo = JSGit.mkrepo(gitDir)
  return {
    saveBlob: (buffer: Buffer) =>
      P.p(o =>
        repo.saveAs('blob', buffer, (err, hash) => {
          if (err) o(P.rError(err))
          else o(P.rValue(hash))
        })
      ),
    saveTree: (tree: Tree) =>
      P.p(o => {
        const jstree: JSGit.Tree = {}
        for (var name in tree)
          jstree[name] = { mode: repo.modes[tree[name].mode], hash: tree[name].hash }
        repo.saveAs('tree', jstree, (err, hash) => {
          if (err) o(P.rError(err))
          else o(P.rValue(hash))
        })
      }),
    saveCommit: (buffer: Commit) =>
      P.p(o => {
        repo.saveAs(
          'commit',
          {
            tree: buffer.tree,
            parents: buffer.parents.map(a => a),
            author: buffer.author,
            commiter: buffer.commiter,
            message: buffer.message
          },
          (err, hash) => {
            if (err) o(P.rError(err))
            else o(P.rValue(hash))
          }
        )
      }),
    loadBlob: (hash: string) =>
      P.p(o =>
        repo.loadAs('blob', hash, (err, buffer) => {
          if (err) o(P.rError(err))
          else if (buffer) o(P.rValue(buffer))
          else o(P.rError(new Error(`hash ${hash} not found`)))
        })
      ),
    loadTree: (hash: string) =>
      P.p(o =>
        repo.loadAs('tree', hash, (err, tree) => {
          if (err) o(P.rError(err))
          else if (tree) {
            const gtree: Tree = {}
            for (var name in tree) {
              const e = tree[name]
              if (e.mode === 33188) gtree[name] = { mode: 'blob', hash: e.hash }
              else if (e.mode === 16384) gtree[name] = { mode: 'tree', hash: e.hash }
              else if (e.mode === 57344) gtree[name] = { mode: 'commit', hash: e.hash }
              else if (e.mode === 33261) gtree[name] = { mode: 'exec', hash: e.hash }
              else if (e.mode === 33188) gtree[name] = { mode: 'file', hash: e.hash }
              else if (e.mode === 40960) gtree[name] = { mode: 'sym', hash: e.hash }
            }
            o(P.rValue(gtree))
          } else o(P.rError(new Error(`hash ${hash} not found`)))
        })
      ),
    loadCommit: (hash: string) =>
      P.p(o =>
        repo.loadAs('commit', hash, (err, commit) => {
          if (err) o(P.rError(err))
          else if (commit)
            o(
              P.rValue({
                tree: commit.tree,
                parents: commit.parents.map(a => a),
                author: commit.author,
                commiter: commit.commiter,
                message: commit.message
              })
            )
          else o(P.rError(new Error(`hash ${hash} not found`)))
        })
      )
  }
}
