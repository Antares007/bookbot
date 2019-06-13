// @flow strict
import * as P from './tP'
import * as JSGit from './js-git/js-git'

export opaque type HTree = { T: 'tree', repo: JSGit.Repo, hash: string }
export opaque type HBlob = { T: 'blob', repo: JSGit.Repo, hash: string }
export opaque type HCommit = { T: 'commit', repo: JSGit.Repo, hash: string }

export type VBlob = Buffer
export type VTree = {
  [string]:
    | { mode: 'tree', hashish: HTree }
    | { mode: 'blob', hashish: HBlob }
    | { mode: 'exec', hashish: HBlob }
    | { mode: 'sym', hashish: HBlob }
    | { mode: 'commit', hashish: HCommit }
}
export type VCommit = {
  tree: HTree,
  parents: Array<HCommit>,
  author: { name: string, email: string, date: { seconds: number, offset: number } },
  commiter: { name: string, email: string, date: { seconds: number, offset: number } },
  message: string
}

declare var save: (VTree => P.PPith<HTree>) &
  (VBlob => P.PPith<HBlob>) &
  (VCommit => P.PPith<HCommit>)

declare var load: (HTree => P.PPith<VTree>) &
  (HBlob => P.PPith<VBlob>) &
  (HCommit => P.PPith<VCommit>)

declare var repo: JSGit.Repo

let seet = load({ T: 'tree', repo, hash: '' })
let seeb = load({ T: 'blob', repo, hash: '' })
let seec = load({ T: 'commit', repo, hash: '' })
