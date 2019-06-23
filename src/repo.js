// @flow strict
import * as JSGit from './js-git/js-git'
import * as P from './P'

export type Hash = string
export const emptyTreeHash: Hash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

export type Tree = {
  [string]: { mode: 'tree' | 'blob' | 'exec' | 'sym' | 'commit', hash: Hash }
}
export type Commit = JSGit.Commit

export type Repo = {
  loadTree: Hash => P.PPith<?Tree>,
  loadBlob: Hash => P.PPith<?Buffer>,
  loadCommit: Hash => P.PPith<?Commit>,
  saveTree: Tree => P.PPith<Hash>,
  saveBlob: Buffer => P.PPith<Hash>,
  saveCommit: Commit => P.PPith<Hash>
}

export function mkrepo(gitdir: string): Repo {
  const repo = JSGit.mkrepo(gitdir)
  return {
    loadTree: hash =>
      P.p(o =>
        repo.loadAs('tree', hash, (err, a) => {
          if (err) o(P.rError(err))
          else if (!a) o(P.rValue(a))
          else {
            o(
              P.rValue(
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
      P.p(o => repo.loadAs('blob', hash, (err, a) => (err ? o(P.rError(err)) : o(P.rValue(a))))),
    loadCommit: hash =>
      P.p(o => repo.loadAs('commit', hash, (err, a) => (err ? o(P.rError(err)) : o(P.rValue(a))))),
    saveTree: a =>
      P.p(o =>
        repo.saveAs(
          'tree',
          Object.keys(a).reduce((t, name) => {
            const { mode: m, hash } = a[name]
            t[name] = { mode: JSGit.modes[m], hash }
            return t
          }, ({}: JSGit.Tree)),
          (err, a) => (err ? o(P.rError(err)) : o(P.rValue(a)))
        )
      ),
    saveBlob: a =>
      P.p(o => repo.saveAs('blob', a, (err, a) => (err ? o(P.rError(err)) : o(P.rValue(a))))),
    saveCommit: body =>
      P.p(o => repo.saveAs('commit', body, (err, a) => (err ? o(P.rError(err)) : o(P.rValue(a)))))
  }
}
