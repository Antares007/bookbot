// @flow strict
import * as S from './S'
import * as JSGit from './js-git/js-git'
import * as P from './P'
import * as LR from './LR'

export type Tree = {
  [string]: { mode: 'tree' | 'blob' | 'exec' | 'sym' | 'commit', hash: Hash }
}
export type Blob = Buffer
export type Commit = JSGit.Commit

export type Repo = {
  loadTree: Hash => P.CBPith<?Tree>,
  loadBlob: Hash => P.CBPith<?Blob>,
  loadCommit: Hash => P.CBPith<?Commit>,
  saveTree: Tree => P.CBPith<Hash>,
  saveBlob: Blob => P.CBPith<Hash>,
  saveCommit: Commit => P.CBPith<Hash>
}

export type Hash = string

export const emptyTreeHash: Hash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

export type B = (Repo, ?Hash) => P.CBPith<Hash>

export type Rays = { R: 'tree' | 'blob' | 'exec' | 'sym' | 'commit', name: string, b: B }

export type Pith = ((Rays) => void, Tree) => void

export const blobBark = (f: (?Buffer) => Buffer): B => (repo, ohash) =>
  P.flatMap(mbuffer => repo.saveBlob(f(mbuffer)), ohash ? repo.loadBlob(ohash) : P.right(null))

export function treeBark(pith: Pith): B {
  return (repo, initHash) =>
    P.flatMap(
      otree => {
        const rays: Array<Rays> = []
        pith(r => {
          rays.push(r)
        }, otree || {})
        return P.flatMap(
          hashes =>
            repo.saveTree(
              hashes.reduce((t, hash: Hash, i: number) => {
                t[rays[i].name] = { mode: rays[i].R, hash }
                return t
              }, ({}: Tree))
            ),
          P.all(rays.map(r => r.b(repo, otree[r.name] ? otree[r.name].hash : null)))
        )
      },
      initHash ? P.map(t => t || {}, repo.loadTree(initHash)) : P.right({})
    )
}

export function mkrepo(gitdir: string): Repo {
  const repo = JSGit.mkrepo(gitdir)
  return {
    loadTree: hash =>
      P.p(o =>
        repo.loadAs('tree', hash, (err, a) => {
          if (err) o(LR.left(err))
          else if (!a) o(LR.right(a))
          else {
            o(
              LR.right(
                Object.keys(a).reduce((t, name) => {
                  const { mode: m, hash } = a[name]
                  if (m === 16384) t[name] = { mode: 'tree', hash }
                  else if (m === 33188) t[name] = { mode: 'blob', hash }
                  else if (m === 33261) t[name] = { mode: 'exec', hash }
                  else if (m === 40960) t[name] = { mode: 'sym', hash }
                  else if (m === 57344) t[name] = { mode: 'commit', hash }
                  else throw new Error('never')
                  return t
                }, ({}: Tree))
              )
            )
          }
        })
      ),
    loadBlob: hash =>
      P.p(o => repo.loadAs('blob', hash, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a))))),
    loadCommit: hash =>
      P.p(o => repo.loadAs('commit', hash, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a))))),
    saveTree: a =>
      P.p(o =>
        repo.saveAs(
          'tree',
          Object.keys(a).reduce((t, name) => {
            const { mode: m, hash } = a[name]
            t[name] = { mode: JSGit.modes[m], hash }
            return t
          }, ({}: JSGit.Tree)),
          (err, a) => (err ? o(LR.left(err)) : o(LR.right(a)))
        )
      ),
    saveBlob: a =>
      P.p(o => repo.saveAs('blob', a, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a))))),
    saveCommit: body =>
      P.p(o => repo.saveAs('commit', body, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a)))))
  }
}
