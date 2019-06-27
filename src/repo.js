// @flow strict
import * as JSGit from './js-git/js-git'
import * as CB from './CB'
import * as LR from './LR'

export type Hash = string
export const emptyTreeHash: Hash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

export type Tree = {
  [string]: { mode: 'tree' | 'blob' | 'exec' | 'sym' | 'commit', hash: Hash }
}
export type Commit = JSGit.Commit

export type Repo = {
  loadTree: Hash => CB.CBPith<?Tree>,
  loadBlob: Hash => CB.CBPith<?Buffer>,
  loadCommit: Hash => CB.CBPith<?Commit>,
  saveTree: Tree => CB.CBPith<Hash>,
  saveBlob: Buffer => CB.CBPith<Hash>,
  saveCommit: Commit => CB.CBPith<Hash>
}

export function mkrepo(gitdir: string): Repo {
  const repo = JSGit.mkrepo(gitdir)
  return {
    loadTree: hash =>
      CB.p(o =>
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
      CB.p(o => repo.loadAs('blob', hash, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a))))),
    loadCommit: hash =>
      CB.p(o => repo.loadAs('commit', hash, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a))))),
    saveTree: a =>
      CB.p(o =>
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
      CB.p(o => repo.saveAs('blob', a, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a))))),
    saveCommit: body =>
      CB.p(o => repo.saveAs('commit', body, (err, a) => (err ? o(LR.left(err)) : o(LR.right(a)))))
  }
}
