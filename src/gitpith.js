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

type CAS = Buffer => Promise<string>

opaque type BlobHash = string
opaque type TreeHash = string
opaque type CommitHash = string

type BlobEntry = { T: 'blob', name: string, s: CAS => S.S<BlobHash> }
type TreeEntry = { T: 'tree', name: string, s: CAS => S.S<Promise<TreeHash>> }
type CommitEntry = { T: 'commit', name: string, s: CAS => S.S<Promise<CommitHash>> }

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

function runBlob(s: S.S<string | Buffer>): CAS => S.S<BlobHash> {
  return cas =>
    S.s(o => {
      var buffer: ?Buffer
      var p: ?Promise<void> = null
      var nextE

      s.run(e => {
        nextE = e
        if (!p) p = new Promise(store)
      })

      function store() {
        const e = nextE
        if (e instanceof S.Next)
          return cas(Buffer.from('a', 'utf8')).then(hash => {
            p = nextE === e ? null : new Promise(store)
            o(S.next(hash))
          })
        else o(e)
      }
    })
}

function runTree(pith: GTreePith): CAS => S.S<Promise<TreeHash>> {
  return cas =>
    S.s(o => {
      const entries = []
      pith(v => {
        entries.push(v.s)
      })
      let see = S.combine(
        entries =>
          Promise.all(entries.map(e => e.s(cas))).then(hashes => {
            let see = hashes[0]
          }),
        entries
      )
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
