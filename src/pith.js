// @flow strict
import * as S from './S'
export type Pith<+O, -A, +B> = ((O) => void, A) => B

export type SS<+A> = S.S<A> | A

export class NPatch extends S.S<(Node) => void> {}

export class NElement {
  tag: string
  r: NPatch
  key: ?string
  constructor(tag: string, r: NPatch, key?: string) {
    this.tag = tag
    this.r = r
    this.key = key
  }
}
export class NElementNS {
  tag: string
  pith: NPatch
  ns: string
}
export class NText {
  tag: '#text'
  value: string
}
export class NComment {
  tag: '#comment'
  value: string
}
export class NChild extends S.S<NElement | NElementNS | NText | NComment> {}
const elm = (tag: string, r: NPatch, key?: string): NElement => new NElement(tag, r, key)
const child = (ss: SS<NElement | NElementNS | NText | NComment>): NChild =>
  new NChild((ss instanceof S.S ? ss : S.d(ss)).f)

const patch = (ss: SS<(Node) => void>): NPatch => new NPatch((ss instanceof S.S ? ss : S.d(ss)).f)

export class NStyle extends S.S<{ [string]: ?string }> {}

type P = Pith<NChild | NStyle, void, void>

function run(pith: P): NPatch {
  throw new Error()
}

run(function counter(o, i) {
  o(child(elm('div', run(function counter(o, i) {}))))
})

import * as D from './S/Disposable'
export class End {}
export class Next<+A> {
  +value: A
  constructor(value: A) {
    this.value = value
  }
}

type SPith<+A> = Pith<Next<A> | Error | End | D.Disposable, void, void>
class Sd<+A> {
  +f: SPith<A>
}
var s: SPith<number>

const srun = (<+A>(o, s) => {
  return D.empty
}: Pith<Next<A> | Error | End, SPith<A>, D.Disposable>)
