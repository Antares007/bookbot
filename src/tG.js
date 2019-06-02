// @flow strict
export type Repo = {}
import repo from './js-git'
export opaque type BlobHash = string
export opaque type TreeHash = string

export type Pith = (
  (
    | { R: 'Blob', name: string, b: Repo => Promise<BlobHash> }
    | { R: 'Tree', name: string, b: Repo => Promise<TreeHash> }
  ) => void
) => void

export function treeBark(pith: Pith): Repo => Promise<TreeHash> {
  return repo => Promise.reject(new Error('ni'))
}

treeBark(o => {
  o({ R: 'Blob', name: 'a', b: repo => Promise.resolve('a') })
  o({ R: 'Tree', name: 'b', b: treeBark(o => {}) })
})
const r = repo(__dirname + '/../.git')
window.r = r

r.loadAs('tree', '496d34d1c13f5a11d1cbd99743d1f0f34768c998', (e, d) => {
  console.log(d)
})
