// @flow strict
import * as JSGit from './js-git'
import * as G from './tG'
import * as S from './tS'

export type Pith = (
  (
    S.SPith<
      | { R: 'blob', name: string, b: JSGit.Repo => Promise<G.BlobHash> }
      | { R: 'file', name: string, b: JSGit.Repo => Promise<G.BlobHash> }
      | { R: 'exec', name: string, b: JSGit.Repo => Promise<G.BlobHash> }
      | { R: 'sym', name: string, b: JSGit.Repo => Promise<G.BlobHash> }
      | { R: 'tree', name: string, b: JSGit.Repo => Promise<G.TreeHash> }
      | { R: 'commit', name: string, b: JSGit.Repo => Promise<G.CommitHash> }
    >
  ) => void
) => void

export function treeBark(pith: Pith): S.SPith<(JSGit.Repo) => Promise<G.TreeHash>> {
  return S.flatMap(pith => {
    const rays: Array<$Call<<R>(((R) => void) => void) => R, Pith>> = []

    pith(r => {
      rays.push(r)
    })

    return S.combine(
      (...rays) =>
        G.treeBark(o => {
          for (var r of rays) o(r)
        }),
      ...rays
    )
  }, S.d(pith))
}
