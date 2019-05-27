// @flow strict
import type { Pith } from './pith'
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'

export type SRay<+A> = { T: 'next', +value: A } | { T: 'end' } | { T: 'error', error: Error }

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
        d = Schdlr.delay(() => o({ T: 'end' }))
        o({ T: 'next', value: a })
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
        o({ T: 'error', error })
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
    return Schdlr.delay(() => o({ T: 'end' }))
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
        o({ T: 'next', value: void 0 })
      })
      return D.create(() => d.dispose())
    }
  }
}

export function run<A>(o: (SRay<A>) => void, s: S<A>): D.Disposable {
  const d = s.pith(function runO(r) {
    if (r.T === 'error') o(r)
    else
      try {
        o(r)
      } catch (error) {
        d.dispose()
        o({ T: 'error', error })
      }
  })
  return d
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return {
    T: 's',
    pith: function mapPith(o) {
      const d = s.pith(function mapO(r) {
        if (r.T === 'next') {
          var b
          try {
            b = f(r.value)
          } catch (error) {
            d.dispose()
            return o({ T: 'error', error })
          }
          o({ T: 'next', value: b })
        } else o(r)
      })
      return d
    }
  }
}

export function filter<A>(f: A => boolean, s: S<A>): S<A> {
  return {
    T: 's',
    pith: function mapPith(o) {
      const d = s.pith(function mapO(r) {
        if (r.T === 'next') {
          var b
          try {
            b = f(r.value)
          } catch (error) {
            d.dispose()
            return o({ T: 'error', error })
          }
          b && o(r)
        } else o(r)
      })
      return d
    }
  }
}

export function scan<A, B>(f: (B, A) => B, b: B, s: S<A>): S<B> {
  return {
    T: 's',
    pith: function scanPith(o) {
      var acc = b
      const d = s.pith(function scanO(r) {
        if (r.T === 'next') {
          try {
            acc = f(acc, r.value)
          } catch (error) {
            d.dispose()
            return o({ T: 'error', error })
          }
          o({ T: 'next', value: acc })
        } else o(r)
      })
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
          s.pith(function mergeO(r) {
            if (r.T === 'next') o(r)
            else {
              dmap.delete(s)
              if (r.T === 'end') dmap.size === 0 && o(r)
              else d.dispose(), o(r)
            }
          })
        )
      )
      return d
    }
  }
}

export function combine<A, B>(f: (...Array<A>) => B, ...ss: Array<S<A>>): S<B> {
  return {
    T: 's',
    pith: function combinePith(o) {
      const dmap = new Map()
      const d = D.create(() => dmap.forEach(d => d.dispose()))
      const indices: Array<number> = []
      const values = new Array(ss.length)
      var hasallvalues = false
      ss.forEach((s, index) =>
        dmap.set(
          s,
          s.pith(function combineO(r) {
            if (r.T === 'next') {
              values[index] = r.value
              goto: while (true) {
                if (hasallvalues) {
                  var b
                  try {
                    b = f(...values)
                  } catch (error) {
                    d.dispose()
                    return o({ T: 'error', error })
                  }
                  o({ T: 'next', value: b })
                  break
                } else {
                  const pos = Schdlr.binarySearchRightmost(index, indices)
                  if (pos === -1 || indices[pos] < index) {
                    indices.splice(pos + 1, 0, index)
                    if ((hasallvalues = indices.length === values.length)) continue goto
                    else break
                  }
                }
              }
            } else {
              dmap.delete(s)
              if (r.T === 'end') dmap.size === 0 && o(r)
              else d.dispose(), o(r)
            }
          })
        )
      )
      return d
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
      var sod: ?D.Disposable = so.pith(function switchLatestOO(r) {
        if (r.T === 'next') {
          sid && sid.dispose()
          sid = r.value.pith(function switchLatestIO(r) {
            if (r.T === 'next') o(r)
            else {
              sid = null
              if (r.T === 'end') sod || o(r)
              else d.dispose(), o(r)
            }
          })
        } else {
          sod = null
          if (r.T === 'end') sid || o(r)
          else d.dispose(), o(r)
        }
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
        so.pith(function flatMapOO(r) {
          if (r.T === 'next') {
            var si
            try {
              si = f(r.value)
            } catch (err) {
              d.dispose()
              return o({ T: 'error', error: err })
            }
            dmap.set(
              si,
              si.pith(function flatMapIO(r) {
                if (r.T === 'next') o(r)
                else {
                  dmap.delete(si)
                  if (r.T === 'end') dmap.size === 0 && o(r)
                  else d.dispose(), o(r)
                }
              })
            )
          } else {
            dmap.delete(so)
            if (r.T === 'end') dmap.size === 0 && o(r)
            else d.dispose(), o(r)
          }
        })
      )
      return d
    }
  }
}

export function flatMapEnd<A>(f: () => S<A>, s: S<A>): S<A> {
  return {
    T: 's',
    pith: function flatMapEndPith(o) {
      var d = s.pith(function flatMapEndO(r) {
        if (r.T === 'end') {
          var s
          try {
            s = f()
          } catch (error) {
            d.dispose()
            return o({ T: 'error', error })
          }
          d = s.pith(o)
        } else o(r)
      })
      return D.create(() => d.dispose())
    }
  }
}

export function flatMapError<A>(f: Error => S<A>, s: S<A>): S<A> {
  return {
    T: 's',
    pith: function flatMapErrorPith(o) {
      var d = s.pith(function flatMapErrorO(r) {
        if (r.T === 'error') {
          var s
          try {
            s = f(r.error)
          } catch (error) {
            d.dispose()
            return o({ T: 'error', error })
          }
          d = s.pith(o)
        } else o(r)
      })
      return D.create(() => d.dispose())
    }
  }
}

export function multicast<A>(s: S<A>): S<A> {
  var d = null
  var os = []
  return {
    T: 's',
    pith(o) {
      os.push(o)
      if (d == null)
        d = s.pith(r => {
          if (r.T === 'next') os.forEach(o => o(r))
          else {
            const os_ = os
            d = null
            os = []
            os_.forEach(o => o(r))
          }
        })
      return D.create(() => {
        const pos = os.indexOf(o)
        if (pos !== -1) {
          os.splice(pos, 1)
          if (os.length === 0 && d) d = d.dispose()
        }
      })
    }
  }
}
