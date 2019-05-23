// @flow strict

declare module 'js-git/lib/modes' {
  declare type Mode = 33188 | 57344 | 33261 | 33188 | 40960 | 16384
  declare module.exports: {
    isBlob(Mode): boolean,
    isFile(Mode): boolean,
    toType(Mode): 'blob' | 'tree' | 'commit',
    blob: 33188,
    commit: 57344,
    exec: 33261,
    file: 33188,
    sym: 40960,
    tree: 16384
  }
}

declare module 'js-git/lib/object-codec' {
  declare type Hash = string
  declare type Person = { name: string, email: string, date: { seconds: number, offset: number } }
  declare type Tree = {
    [string]: { mode: 33188 | 57344 | 33261 | 33188 | 40960 | 16384, hash: Hash }
  }
  declare type Commit = {
    tree: Hash,
    parents: Array<Hash>,
    author: Person,
    commiter: Person,
    message: string
  }
  declare type Tag = {
    object: Hash,
    type: 'commit' | 'tree' | 'blob',
    tag: string,
    tagger: Person,
    message: string
  }
  declare module.exports: {
    frame({ type: 'blob' | 'tree' | 'commit' | 'tag', body: Buffer }): Buffer,
    deframe(Buffer): { type: 'blob' | 'tree' | 'commit' | 'tag', body: Buffer },
    encoders: {
      blob(Buffer): Buffer,
      tree(Tree): Buffer,
      commit(Commit): Buffer,
      tag(Tag): Buffer
    },
    decoders: {
      blob(Buffer): Buffer,
      tree(Buffer): Tree,
      commit(Buffer): Commit,
      tag(Buffer): Tag
    }
  }
}
