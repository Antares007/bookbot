// @flow strict

import type { Pith } from './pith'
import * as S from './S'

opaque type BlobSha = string
opaque type TreeSha = string
opaque type CommitSha = string

type BlobT = { T: 'blob', name: string, s: S.S<BlobSha> }
type TreeT = { T: 'tree', name: string, s: S.S<TreeSha> }
type CommitT = { T: 'commit', name: string, s: S.S<CommitSha> }
type EntryR = { R: 'entry', s: S.S<BlobT | TreeT | CommitT> }

type GTreePith = Pith<EntryR, void, void>

const blob = (name: string, s: S.S<BlobSha>): BlobT => ({ T: 'blob', name, s })
const tree = (name: string, s: S.S<TreeSha>): TreeT => ({ T: 'tree', name, s })

const entry = (s: S.S<BlobT | TreeT | CommitT>): EntryR => ({ R: 'entry', s })

const p: GTreePith = o => {
  o(entry(S.d(blob('hey', runBlob(S.d(''))))))
  o(
    entry(
      S.d(
        tree(
          'hey2',
          runTree(o => {
            o(entry(S.d(blob('hey', runBlob(S.d(''))))))
          })
        )
      )
    )
  )
}

function runBlob(s: S.S<string | Buffer>): S.S<BlobSha> {
  throw new Error()
}
function runTree(pith: GTreePith): S.S<TreeSha> {
  throw new Error()
}
