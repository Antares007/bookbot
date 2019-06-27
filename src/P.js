// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as LR from './LR'

export type CBPith<+A> = ((LR.Left<Error> | LR.Right<A>) => void) => void
export const bark = <A>(pith: CBPith<A>): CBPith<A> => {
  pith(r => {})
  throw new Error()
}

export function p<A>(pith: ((LR.Left<Error> | LR.Right<A>) => void) => void): CBPith<A> {
  var result: LR.Right<A> | LR.Left<Error>
  var Os: ?Array<(LR.Right<A> | LR.Left<Error>) => void> = []
  pith(r => {
    if (!Os) return
    const os = Os
    result = r
    Os = null
    Schdlr.delay(() => os.forEach(o => o(r)))
  })
  return function(o) {
    if (Os) Os.push(o)
    else Schdlr.delay(() => o(result))
  }
}

export function right<A>(a: A): CBPith<A> {
  return p(o => o(LR.right(a)))
}

export function left(value: Error): CBPith<empty> {
  return p(o => o(LR.left(value)))
}

export function map<A, B>(f: A => B, ps: CBPith<A>): CBPith<B> {
  return p(o => ps(r => o(LR.map(f, r))))
}

export function flatMap<A, B>(f: A => CBPith<B>, ps: CBPith<A>): CBPith<B> {
  return p(o => ps(r => (r.T === 'right' ? f(r.value)(o) : o(r))))
}

export function all<A>(ps: Array<CBPith<A>>): CBPith<Array<A>> {
  var count = 0
  var left = ps.length
  if (left === 0) return p(o => o(LR.right([])))
  var results = new Array(left)
  return p(o =>
    ps.forEach((p, index) =>
      p(r => {
        if (r.T === 'right') {
          results[index] = r.value
          if (!--left) o(LR.right(results))
        } else o(r)
      })
    )
  )
}
