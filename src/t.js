// @flow strict
import type { Pith } from './pith'
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'

type SRay<+A> = { R: 'next', +value: A } | { R: 'end' } | { R: 'error', error: Error }
type SPith<+A> = Pith<SRay<A>, void, D.Disposable>

export const delay = Schdlr.delay

export type S<+A> = { T: 's', +pith: SPith<A> }

export function s<A>(pith: SPith<A>): S<A> {
  return {
    T: 's',
    pith: o => {
      var d
      try {
        d = pith(o)
      } catch (err) {
        return throwError(err).pith(o)
      }
      return d
    }
  }
}

export function d<A>(a: A, delay: number = 0): S<A> {
  return {
    T: 's',
    pith: function dPith(o) {
      var d = Schdlr.delay(() => {
        d = Schdlr.delay(() => o({ R: 'end' }))
        o({ R: 'next', value: a })
      }, delay)
      return D.create(() => d.dispose())
    }
  }
}

export function throwError(error: Error): S<empty> {
  return {
    T: 's',
    pith: function throwErrorPith(o) {
      var d = Schdlr.delay(() => {
        d = null
        o({ R: 'error', error })
      })
      return D.create(() => {
        d && d.dispose()
      })
    }
  }
}

export const empty: S<empty> = {
  T: 's',
  pith: function emptyPith(o) {
    return Schdlr.delay(() => o({ R: 'end' }))
  }
}

export const never: S<empty> = {
  T: 's',
  pith: function neverPith(o) {
    return D.empty
  }
}

export function periodic(period: number): S<void> {
  return {
    T: 's',
    pith: function periodicPith(o) {
      var d = Schdlr.delay(function periodicNext() {
        d = Schdlr.delay(periodicNext, period)
        o({ R: 'next', value: void 0 })
      })
      return D.create(() => d.dispose())
    }
  }
}

export function run<A>(o: (SRay<A>) => void, s: S<A>): D.Disposable {
  const d = s.pith(function runO(e) {
    if (e.R === 'error') o(e)
    else
      try {
        o(e)
      } catch (error) {
        d.dispose()
        o({ R: 'error', error })
      }
  })
  return d
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return {
    T: 's',
    pith: function mapPith(o) {
      const d = s.pith(function mapO(e) {
        if (e.R === 'next') {
          var b
          try {
            b = f(e.value)
          } catch (err) {
            d.dispose()
            return o({ R: 'error', error: err })
          }
          o({ R: 'next', value: b })
        } else o(e)
      })
      return d
    }
  }
}

export function filter<A>(f: A => boolean, s: S<A>): S<A> {
  return {
    T: 's',
    pith: function mapPith(o) {
      const d = s.pith(function mapO(e) {
        if (e.R === 'next') {
          var b
          try {
            b = f(e.value)
          } catch (err) {
            d.dispose()
            return o({ R: 'error', error: err })
          }
          b && o(e)
        } else o(e)
      })
      return d
    }
  }
}

export function flatMap<A, B>(f: A => S<B>, so: S<A>): S<B> {
  return {
    T: 's',
    pith: function flatMapPith(o) {
      const dmap = new Map()
      const d = D.create(() => dmap.forEach(d => d.dispose()))
      dmap.set(
        so,
        so.pith(function flatMapOO(e) {
          if (e.R === 'next') {
            var si
            try {
              si = f(e.value)
            } catch (err) {
              d.dispose()
              return o({ R: 'error', error: err })
            }
            dmap.set(
              si,
              si.pith(function flatMapIO(e) {
                if (e.R === 'next') o(e)
                else {
                  dmap.delete(si)
                  if (e.R === 'end') dmap.size === 0 && o(e)
                  else d.dispose(), o(e)
                }
              })
            )
          } else {
            dmap.delete(so)
            if (e.R === 'end') dmap.size === 0 && o(e)
            else d.dispose(), o(e)
          }
        })
      )
      return d
    }
  }
}

export function merge<A>(...ss: Array<S<A>>): S<A> {
  return {
    T: 's',
    pith: function mergePith(o) {
      const dmap = new Map()
      const d = D.create(() => dmap.forEach(d => d.dispose()))
      ss.forEach(s =>
        dmap.set(
          s,
          s.pith(function mergeO(e) {
            if (e.R === 'next') o(e)
            else {
              dmap.delete(s)
              if (e.R === 'end') dmap.size === 0 && o(e)
              else d.dispose(), o(e)
            }
          })
        )
      )
      return d
    }
  }
}

export function flatMapEnd<A>(f: () => S<A>, sa: S<A>): S<A> {
  return {
    T: 's',
    pith: function flatMapEndPith(o) {
      var d = sa.pith(function flatMapEndO(e) {
        if (e.R === 'end') d = f().pith(o)
        else o(e)
      })
      return D.create(() => d.dispose())
    }
  }
}

export function flatMapError<A>(f: Error => S<A>, sa: S<A>): S<A> {
  return {
    T: 's',
    pith: function flatMapErrorPith(o) {
      var d = sa.pith(function flatMapErrorO(e) {
        if (e.R === 'error') d = f(e.error).pith(o)
        else o(e)
      })
      return D.create(() => d.dispose())
    }
  }
}

export function switchLatest<A>(so: S<S<A>>): S<A> {
  return {
    T: 's',
    pith: function switchLatestPith(o) {
      const d = D.create(() => {
        sod && sod.dispose()
        sid && sid.dispose()
      })
      var sid: ?D.Disposable = null
      var sod: ?D.Disposable = so.pith(function switchLatestOO(e) {
        if (e.R === 'next') {
          sid && sid.dispose()
          sid = e.value.pith(function switchLatestIO(e) {
            if (e.R === 'next') o(e)
            else {
              sid = null
              if (e.R === 'end') sod || o(e)
              else d.dispose(), o(e)
            }
          })
        } else {
          sod = null
          if (e.R === 'end') sid || o(e)
          else d.dispose(), o(e)
        }
      })
      return d
    }
  }
}

export function scan<A, B>(f: (B, A) => B, b: B, sa: S<A>): S<B> {
  return {
    T: 's',
    pith: function scanPith(o) {
      var acc = b
      return sa.pith(function scanO(e) {
        if (e.R === 'next') o({ R: 'next', value: (acc = f(acc, e.value)) })
        else o(e)
      })
    }
  }
}
