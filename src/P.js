// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as LR from './LR'

export type PPith<+A> = ((LR.Left<Error> | LR.Right<A>) => void) => void
export const bark = <A>(pith: PPith<A>): PPith<A> => {
  pith(r => {})
  throw new Error()
}

export function p<A>(pith: ((LR.Left<Error> | LR.Right<A>) => void) => void): PPith<A> {
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

export function right<A>(a: A): PPith<A> {
  return p(o => o(LR.right(a)))
}

export function left(value: Error): PPith<empty> {
  return p(o => o(LR.left(value)))
}

export function map<A, B>(f: A => B, ps: PPith<A>): PPith<B> {
  return p(o =>
    ps(r => {
      if (r.T === 'right') {
        var result
        try {
          result = f(r.value)
        } catch (value) {
          return o(LR.left(value))
        }
        o(LR.right(result))
      } else o(r)
    })
  )
}

export function flatMap<A, B>(f: A => PPith<B>, ps: PPith<A>): PPith<B> {
  return p(o =>
    ps(r => {
      if (r.T === 'right') {
        var result
        try {
          result = f(r.value)
        } catch (error) {
          return o(LR.left(error))
        }
        result(o)
      } else o(r)
    })
  )
}

export function all<A>(ps: Array<PPith<A>>): PPith<Array<A>> {
  var count = 0
  if (ps.length === 0) return p(o => o(LR.right([])))
  var results = new Array(ps.length)
  return p(o =>
    ps.forEach((p, i) =>
      p(r => {
        if (r.T === 'right') {
          results[i] = r.value
          if (++count === results.length) o(LR.right(results))
        } else o(r)
      })
    )
  )
}
