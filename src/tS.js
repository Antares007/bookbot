// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'

export type Ray<+A> = { T: 'next', +value: A } | { T: 'end' } | { T: 'error', error: Error }
export opaque type SPith<+A> = ((Ray<A>) => void) => D.Disposable

export const delay = Schdlr.delay

export function s<A>(
  pith: (
    ({ T: 'next', +value: A } | { T: 'end' } | { T: 'error', error: Error }) => void
  ) => D.Disposable
): SPith<A> {
  return o => {
    var d
    try {
      d = pith(o)
    } catch (err) {
      return throwError(err)(o)
    }
    return d
  }
}
export function run<A>(
  o: ({ T: 'next', +value: A } | { T: 'end' } | { T: 'error', error: Error }) => void,
  s: SPith<A>
): D.Disposable {
  const d = s(function runO(r) {
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
export function d<A>(a: A, delay: number = 0): SPith<A> {
  return function dPith(o) {
    var d = Schdlr.delay(() => {
      d = Schdlr.delay(() => o({ T: 'end' }))
      o({ T: 'next', value: a })
    }, delay)
    return D.create(() => d.dispose())
  }
}

export function throwError(error: Error): SPith<empty> {
  return function throwErrorPith(o) {
    var d = Schdlr.delay(() => {
      d = null
      o({ T: 'error', error })
    })
    return D.create(() => {
      d && d.dispose()
    })
  }
}

export const empty: SPith<empty> = function emptyPith(o) {
  return Schdlr.delay(() => o({ T: 'end' }))
}

export const never: SPith<empty> = function neverPith(o) {
  return D.empty
}

export function periodic(period: number): SPith<void> {
  return function periodicPith(o) {
    var d = Schdlr.delay(function periodicNext() {
      d = Schdlr.delay(periodicNext, period)
      o({ T: 'next', value: void 0 })
    })
    return D.create(() => d.dispose())
  }
}

export function map<A, B>(f: A => B, s: SPith<A>): SPith<B> {
  return function mapPith(o) {
    const d = s(function mapO(r) {
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

export function filter<A>(f: A => boolean, s: SPith<A>): SPith<A> {
  return function mapPith(o) {
    const d = s(function mapO(r) {
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

export function scan<A, B>(f: (B, A) => B, b: B, s: SPith<A>): SPith<B> {
  return function scanPith(o) {
    var acc = b
    const d = s(function scanO(r) {
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

export function merge<A>(...ss: Array<SPith<A>>): SPith<A> {
  return function mergePith(o) {
    const dmap = new Map()
    const d = D.create(() => dmap.forEach(d => d.dispose()))
    ss.forEach(s =>
      dmap.set(
        s,
        s(function mergeO(r) {
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

export function combine<A, B>(f: (...Array<A>) => B, ...ss: Array<SPith<A>>): SPith<B> {
  return function combinePith(o) {
    const dmap = new Map()
    const d = D.create(() => dmap.forEach(d => d.dispose()))
    const indices: Array<number> = []
    const values = new Array(ss.length)
    var hasallvalues = false
    ss.forEach((s, index) =>
      dmap.set(
        s,
        s(function combineO(r) {
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

export function switchLatest<A>(so: SPith<SPith<A>>): SPith<A> {
  return function switchLatestPith(o) {
    const d = D.create(() => {
      sod && sod.dispose()
      sid && sid.dispose()
    })
    var sid: ?D.Disposable = null
    var sod: ?D.Disposable = so(function switchLatestOO(r) {
      if (r.T === 'next') {
        sid && sid.dispose()
        sid = r.value(function switchLatestIO(r) {
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

export function flatMap<A, B>(f: A => SPith<B>, so: SPith<A>): SPith<B> {
  return function flatMapPith(o) {
    const dmap = new Map()
    const d = D.create(() => dmap.forEach(d => d.dispose()))
    dmap.set(
      so,
      so(function flatMapOO(r) {
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
            si(function flatMapIO(r) {
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

export function flatMapEnd<A>(f: () => SPith<A>, s: SPith<A>): SPith<A> {
  return function flatMapEndPith(o) {
    var d = s(function flatMapEndO(r) {
      if (r.T === 'end') {
        var s
        try {
          s = f()
        } catch (error) {
          d.dispose()
          return o({ T: 'error', error })
        }
        d = s(o)
      } else o(r)
    })
    return D.create(() => d.dispose())
  }
}

export function flatMapError<A>(f: Error => SPith<A>, s: SPith<A>): SPith<A> {
  return function flatMapErrorPith(o) {
    var d = s(function flatMapErrorO(r) {
      if (r.T === 'error') {
        var s
        try {
          s = f(r.error)
        } catch (error) {
          d.dispose()
          return o({ T: 'error', error })
        }
        d = s(o)
      } else o(r)
    })
    return D.create(() => d.dispose())
  }
}

export function multicast<A>(s: SPith<A>): SPith<A> {
  var d = null
  var os = []
  return function pith(o) {
    os.push(o)
    if (d == null)
      d = s(r => {
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

export function proxy<A>(): [(A) => void, SPith<A>] {
  const os: Array<[(Ray<A>) => void, ?D.Disposable]> = []
  var lastA: A
  return [
    a => {
      lastA = a
      os.forEach(p => {
        const d = p[1]
        if (!d) p[1] = delay(() => p[0]({ T: 'next', value: lastA }))
      })
    },
    function pith(o) {
      const p = [o, lastA ? delay(() => o({ T: 'next', value: lastA })) : null]
      os.push(p)
      return D.create(() => {
        const pos = os.indexOf(p)
        if (pos > -1) {
          const d = os.splice(pos, 1)[0][1]
          d && d.dispose()
        }
      })
    }
  ]
}
