// @flow strict

import type { Pith } from './pith'
import * as S from './S'

import { frame, deframe, encoders, decoders } from 'js-git/lib/object-codec'
import modes from 'js-git/lib/modes'
import sha1 from 'git-sha1'

frame({
  type: 'tree',
  body: encoders.tree({ file: { mode: modes.blob, hash: '' } })
})

type Repo = {
  saveBlob(Buffer): Promise<BlobHash>,
  saveTree({ [string]: { mode: number, hash: string } }): Promise<TreeHash>,
  saveAs(
    'commit',
    { author: { name: string, email: string }, tree: string, message: string }
  ): Promise<CommitHash>
}

opaque type BlobHash = string
opaque type TreeHash = string
opaque type CommitHash = string

type BlobEntry = { T: 'blob', name: string, s: S.S<(Repo) => Promise<BlobHash>> }
type TreeEntry = { T: 'tree', name: string, s: S.S<(Repo) => Promise<TreeHash>> }
type CommitEntry = { T: 'commit', name: string, s: S.S<(Repo) => Promise<CommitHash>> }

type EntryR = { R: 'entry', s: S.S<BlobEntry | TreeEntry | CommitEntry> }

type GTreePith = Pith<EntryR, void, void>

type SS<+A> = S.S<A> | A

const blob = (name: string, ss: SS<string | Buffer>): BlobEntry => {
  return {
    T: 'blob',
    name,
    s: ss instanceof S.S ? runBlob(ss) : runBlob(S.d(ss))
  }
}
const tree = (name: string, pith: GTreePith): TreeEntry => ({ T: 'tree', name, s: runTree(pith) })

const entry = (ss: SS<BlobEntry | TreeEntry | CommitEntry>): EntryR => ({
  R: 'entry',
  s: ss instanceof S.S ? ss : S.d(ss)
})

function runBlob(s: S.S<string | Buffer>): S.S<(Repo) => Promise<BlobHash>> {
  return s.map(s => repo => repo.saveBlob(typeof s === 'string' ? Buffer.from(s, 'utf8') : s))
}

function runTree(pith: GTreePith): S.S<(Repo) => Promise<TreeHash>> {
  return S.s(o => {
    pith(v => {
      //
    })
  })
}

const see = runTree(o => {
  o(entry(blob('hey', 'there')))
  o(
    entry(
      tree('hey1', o => {
        o(entry(blob('hey', 'there')))
        o(
          entry(
            tree('hey1', o => {
              //
            })
          )
        )
      })
    )
  )
})
//const p: GTreePith = o => {
//  o(entry(S.d(blob('hey', runBlob(S.d(''))))))
//  o(
//    entry(
//      S.d(
//        tree(
//          'hey2',
//          runTree(o => {
//            o(entry(S.d(blob('hey', runBlob(S.d(''))))))
//          })
//        )
//      )
//    )
//  )
//}
//var commit = {
//  tree: '',
//  author: {
//    name: 'Tim Caswell',
//    email: 'tim@creationix.com',
//    date: {
//      seconds: 1391790884,
//      offset: 7 * 60
//    }
//  },
//  committer: person,
//  message: 'Test Commit\n',
//  parents: []
//}
