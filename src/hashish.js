// @flow strict
import * as P from './P'
import * as M from './M'
import * as JSGit from './repo'

type Hash = string

export type TreePH = { T: 'tree', hashish: JSGit.Repo => P.CBPith<Hash> }
export type BlobPH = { T: 'blob', hashish: JSGit.Repo => P.CBPith<Hash> }
export type CommitPH = { T: 'commit', hashish: JSGit.Repo => P.CBPith<Hash> }

export type Tree = {
  [string]:
    | { mode: 'tree', value: TreePH }
    | { mode: 'blob' | 'exec' | 'sym', value: BlobPH }
    | { mode: 'commit', value: CommitPH }
}
export type Blob = Buffer
export type Commit = {
  tree: TreePH,
  parents: Array<CommitPH>,
  author: { name: string, email: string, date: { seconds: number, offset: number } },
  commiter: { name: string, email: string, date: { seconds: number, offset: number } },
  message: string
}
const blob: Blob => BlobPH = M.ab(v => {
  return {
    T: 'blob',
    hashish: repo => repo.saveBlob(Buffer.from(v))
  }
})

const tree: Tree => TreePH = M.ab(tree => {
  const names = Object.keys(tree)
  const hashish = repo =>
    P.flatMap(
      hashes =>
        repo.saveTree(
          names.reduce((t, name, i) => {
            t[name] = { mode: tree[name].mode, hash: hashes[i] }
            return t
          }, ({}: JSGit.Tree))
        ),
      P.all(names.map(name => tree[name].value.hashish(repo)))
    )
  return { T: 'tree', hashish }
})

const commit: Commit => CommitPH = M.ab(commit => {
  return { T: 'commit', hashish: repo => P.right('') }
})

const mkrepo: JSGit.Repo => {
  loadBlob: Hash => BlobPH,
  mapTree: ((Tree) => Tree) => TreePH => TreePH,
  mapBlob: ((Blob) => Blob) => BlobPH => BlobPH
} = M.ab(repo => {
  const blobMap = new Map<Hash, BlobPH>()
  const loadBlob: BlobPH => P.CBPith<Blob> = v => {
    return P.flatMap(
      hash =>
        P.map(b => {
          if (!b) throw new Error()
          return b
        }, repo.loadBlob(hash)),
      v.hashish(repo)
    )
  }

  return {
    loadBlob: hash => ({
      T: 'blob',
      hashish: trepo => P.flatMap(mb => (mb ? P.right(hash) : P.right(hash)), trepo.loadBlob(hash))
    }),
    mapTree: f => treePH => {
      let see = P.flatMap(
        hash =>
          P.map(b => {
            if (!b) throw new Error()
            let see = b['a']
            return b
          }, repo.loadTree(hash)),
        treePH.hashish(repo)
      )

      throw new Error()
    },
    mapBlob: f => blobPH => {
      return { T: 'blob', hashish: repo => P.flatMap(b => repo.saveBlob(f(b)), loadBlob(blobPH)) }
    }
  }
})
