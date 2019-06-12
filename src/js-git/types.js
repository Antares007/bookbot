// @flow strict
import type { PPith } from '../tP'

export type Tree = {
  [string]: { mode: 16384 | 33188 | 33261 | 40960 | 57344, hash: string }
}

export type Commit = {
  tree: string,
  parents: Array<string>,
  author: { name: string, email: string, date: { seconds: number, offset: number } },
  commiter: { name: string, email: string, date: { seconds: number, offset: number } },
  message: string
}

export type Repo = {
  loadTree: string => PPith<?Tree>,
  loadBlob: string => PPith<?Buffer>,
  loadCommit: string => PPith<?Commit>,
  saveTree: Tree => PPith<string>,
  saveBlob: Buffer => PPith<string>,
  saveCommit: Commit => PPith<string>
}
