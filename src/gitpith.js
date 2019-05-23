// @flow strict

import type { Pith } from './pith'
import * as S from './S'
import * as D from './S/Disposable'

import { frame, deframe, encoders, decoders } from 'js-git/lib/object-codec'
import modes from 'js-git/lib/modes'
import sha1 from 'git-sha1'

type CAS = Buffer => Promise<string>

opaque type BlobHash = string
opaque type TreeHash = string
opaque type CommitHash = string

type BlobEntry = { T: 'blob', name: string, s: CAS => S.S<BlobHash> }
type TreeEntry = { T: 'tree', name: string, s: CAS => S.S<TreeHash> }
type CommitEntry = { T: 'commit', name: string, s: CAS => S.S<CommitHash> }

type EntryR = { R: 'entry', s: S.S<BlobEntry | TreeEntry | CommitEntry> }

type GTreePith = Pith<EntryR, void, void>

type SS<+A> = S.S<A> | A

const emptyTreeHash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

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
    mapPromise(
      v => cas(frame({ type: 'blob', body: typeof v === 'string' ? Buffer.from(v, 'utf8') : v })),
      s
    )
}

function runTree(pith: GTreePith): CAS => S.S<TreeHash> {
  return cas =>
    S.s(o => {
      const entries = []
      pith(v => {
        entries.push(
          v.s.flatMapLatest(v => v.s(cas).map(hash => ({ type: v.T, name: v.name, hash })))
        )
      })
      if (entries.length)
        o(
          mapPromise(
            buf => cas(buf),
            S.combine(
              entries =>
                frame({
                  type: 'tree',
                  body: encoders.tree(
                    entries.reduce((s, e) => {
                      s[e.name] = { mode: modes[e.type], hash: e.hash }
                      return s
                    }, {})
                  )
                }),
              entries
            )
          ).run(o)
        )
      else o(S.d(emptyTreeHash).run(o))
    })
}

const see = runTree(o => {
  o(entry(blob('hey', 'there')))
  o(
    entry(
      tree('hey1', o => {
        o(entry(blob('hey', 'there')))
        o(entry(tree('hey1', o => {})))
      })
    )
  )
})

see(b => {
  const hash = Promise.resolve(sha1(b))
  return hash
}).run(e => console.log(e))

function mapPromise<A, B>(f: A => Promise<B>, s: S.S<A>): S.S<B> {
  return S.s(o => {
    var p = Promise.resolve()
    var active = true
    const sd = s.run(e => {
      if (e instanceof S.Next) {
        p = p
          .then(() => f(e.value))
          .then(
            b => {
              if (active) o(S.next(b))
            },
            err => (d.dispose(), active && o(err))
          )
      } else if (e instanceof S.End) {
        p = p.then(() => active && o(e), err => (d.dispose(), active && o(err)))
      } else {
        p = p.then(() => active && o(e))
      }
    })
    const d = D.create(() => {
      active = false
      sd.dispose()
    })
    o(d)
  })
}
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
