// @flow strict
import * as P from './tP'
import * as JSGit from './js-git'

export opaque type TreeHash = { T: 'tree', repo: JSGit.Repo, hash: string }
export opaque type BlobHash = { T: 'blob', repo: JSGit.Repo, hash: string }
export opaque type CommitHash = { T: 'commit', repo: JSGit.Repo, hash: string }

export type Tree = {
  [string]:
    | { mode: 'tree', hashish: TreeHash }
    | { mode: 'blob', hashish: BlobHash }
    | { mode: 'exec', hashish: BlobHash }
    | { mode: 'sym', hashish: BlobHash }
    | { mode: 'commit', hashish: CommitHash }
}

function mapTree(f: Tree => Tree, hashtree: TreeHash): TreeHash {
  throw new Error()
}
