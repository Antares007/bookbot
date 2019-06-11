// @flow strict
import * as S from './tS'
import * as JSGit from './js-git'
import * as P from './tP'

export type B<Hash> = (JSGit.Repo, ?Hash) => P.PPith<?Hash>

const a = 0100644

class Hashish {
  p: JSGit.Repo => P.PPith<string>
  constructor(p: JSGit.Repo => P.PPith<string>) {
    this.p = p
  }
}
type Tree = {
  [string]:
    | { mode: '40000', hashish: TreeH }
    | { mode: '100644', hashish: BlobH }
    | { mode: '100755', hashish: BlobH }
    | { mode: '120000', hashish: BlobH }
    | { mode: '160000', hashish: CommitH }
}

class TreeH extends Hashish {
  map(f: JSGit.Tree => JSGit.Tree): TreeH {
    return new TreeH(repo =>
      P.flatMap(
        hash =>
          P.p(o =>
            repo.loadAs('tree', hash, (err, mtree) => {
              if (err || !mtree) o(P.rError(err || new Error('tree not found')))
              else {
                const tree: Tree = Object.keys(mtree).reduce((t, name) => {
                  const e = mtree[name]
                  const mode = e.mode.toString(8)
                  t[name] = {
                    mode,
                    hashish:
                      mode === '40000'
                        ? new TreeH(() => P.resolve(hash))
                        : mode === '160000'
                        ? new CommitH(() => P.resolve(e.hash))
                        : new BlobH(() => P.resolve(e.hash))
                  }
                  return t
                }, {})
                repo.saveAs('tree', f(mtree), (err, hash) => {
                  if (err) o(P.rError(err))
                  else o(P.rValue(hash))
                })
              }
            })
          ),
        this.p(repo)
      )
    )
  }
}
class BlobH extends Hashish {}
class CommitH extends Hashish {}
export opaque type CommitHash: string = string
export opaque type BlobHash: string = string
export opaque type TreeHash: string = string

export const emptyTreeHash: TreeHash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

export type Rays =
  | { R: 'tree', name: string, b: B<TreeHash> }
  | { R: 'blob', name: string, b: B<BlobHash> }
  | { R: 'exec', name: string, b: B<BlobHash> }
  | { R: 'sym', name: string, b: B<BlobHash> }
  | { R: 'commit', name: string, b: B<CommitHash> }

export type Pith = (
  (Rays) => void,
  { [string]: 'tree' | 'blob' | 'exec' | 'sym' | 'commit' }
) => void

export const blobBark = (f: (?Buffer) => Buffer): B<BlobHash> => (repo, ohash) =>
  P.flatMap(
    mbuffer =>
      P.p(o =>
        repo.saveAs('blob', f(mbuffer), (err, hash) => {
          if (err) o(P.rError(err))
          else o(P.rValue(hash))
        })
      ),
    ohash
      ? P.p(o =>
          repo.loadAs('blob', ohash, (err, buffer) => {
            o(P.rValue(buffer))
          })
        )
      : P.resolve(null)
  )

export function treeBark(pith: Pith): B<TreeHash> {
  return (repo, initHash) => {
    return P.flatMap(
      otree => {
        const rays: Array<Rays> = []

        pith(
          r => {
            rays.push(r)
          },
          Object.keys(otree).reduce((t, name) => {
            const m = otree[name].mode
            t[name] =
              m === JSGit.modes.tree
                ? 'tree'
                : m === JSGit.modes.blob
                ? 'blob'
                : m === JSGit.modes.exec
                ? 'exec'
                : m === JSGit.modes.sym
                ? 'sym'
                : 'commit'
            return t
          }, {})
        )

        return P.flatMap(
          hashes => {
            const ntree = Object.assign({}, otree)
            for (var i = 0, l = hashes.length; i < l; i++)
              if (hashes[i]) ntree[rays[i].name] = { mode: JSGit.modes[rays[i].R], hash: hashes[i] }
              else delete ntree[rays[i].name]
            return P.p(o =>
              repo.saveAs('tree', ntree, (err, hash) => {
                if (err) o(P.rError(err))
                else o(P.rValue(hash))
              })
            )
          },
          P.all(
            rays.map(r => {
              const e = otree[r.name]
              return r.b(repo, e && e.mode === JSGit.modes[r.R] ? e.hash : null)
            })
          )
        )
      },
      P.p(o => {
        repo.loadAs('tree', initHash || emptyTreeHash, (err, mtree) => {
          if (err) o(P.rError(err))
          else o(P.rValue(mtree || ({}: JSGit.Tree)))
        })
      })
    )
  }
}

function runPith<R>(pith: ((R) => void) => void): Array<R> {
  const rays: Array<R> = []
  pith(r => {
    rays.push(r)
  })
  return rays
}
