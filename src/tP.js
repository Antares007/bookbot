// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'
import * as S from './tS'

export type RValue<+A> = { +R: 'value', +value: A }
export type RError = { +R: 'error', +error: Error }

export type PPith<+A> = ((RValue<A> | RError) => void) => void

export function p<A>(pith: ((RValue<A> | RError) => void) => void): PPith<A> {
  var result: ?(RValue<A> | RError) = null
  var os: ?Array<(RValue<A> | RError) => void> = null
  return function(o) {
    if (result) {
      const r = result
      Schdlr.delay(() => o(r))
    } else if (os) {
      os.push(o)
    } else {
      os = [o]
      try {
        pith(r => {
          if (!result && os) {
            os.forEach(o => Schdlr.delay(() => o(r)))
            result = r
            os = null
          }
        })
      } catch (error) {
        const err = { R: 'error', error }
        result = err
        os = null
        Schdlr.delay(() => o(err))
      }
    }
  }
}
export function resolve<A>(a: A): RValue<A> {
  return { R: 'value', value: a }
}
export function reject(error: Error): RError {
  return { R: 'error', error }
}

export function map<A, B>(f: A => B, ps: PPith<A>): PPith<B> {
  return p(o =>
    ps(r => {
      if (r.R === 'value') {
        var result
        try {
          result = f(r.value)
        } catch (error) {
          return o({ R: 'error', error })
        }
        o({ R: 'value', value: result })
      } else o(r)
    })
  )
}

export function flatMap<A, B>(f: A => PPith<B>, ps: PPith<A>): PPith<B> {
  return p(o =>
    ps(r => {
      if (r.R === 'value') {
        var result
        try {
          result = f(r.value)
        } catch (error) {
          return o({ R: 'error', error })
        }
        result(o)
      } else o(r)
    })
  )
}

export function all<A>(ps: Array<PPith<A>>): PPith<Array<A>> {
  var count = 0
  if (ps.length === 0) return p(o => o(resolve([])))
  var results = new Array(ps.length)
  return p(o =>
    ps.forEach((p, i) =>
      p(r => {
        if (r.R === 'value') {
          results[i] = r.value
          if (++count === results.length) o({ R: 'value', value: results })
        } else o(r)
      })
    )
  )
}
