// @flow strict
import type { Tree, Commit, Repo } from './types'
import * as JSGit from './js-git'
import * as P from '../tP'

const toP = <A>(f: ((?Error, ?A) => void) => void): P.PPith<A> =>
  P.p(o => f((err, a) => (err || !a ? o(P.rError(err || new Error('na'))) : o(P.rValue(a)))))

export function mkrepo(gitdir: string): Repo {
  const repo = JSGit.mkrepo(gitdir)
  return {
    loadTree: hash => toP(repo.loadAs('tree', hash)),
    loadBlob: hash => toP(repo.loadAs('blob', hash)),
    loadCommit: hash => toP(repo.loadAs('commit', hash)),
    saveTree: tree => toP(repo.saveAs('tree', tree)),
    saveBlob: blob => toP(repo.saveAs('blob', blob)),
    saveCommit: commit => toP(repo.saveAs('commit', commit))
  }
}
