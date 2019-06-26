// @flow strict
type P<+O> = ((O) => void) => void
export type CB<+A> = ((Error | A) => void) => void
export type CPith<+A> = P<P<A | Error>>

export const onNextFrame = (f: () => void): void => {
  setTimeout(f, 0)
}

const noop = (_1, _2) => {}

export const parBark = <A>(pith: P<P<A | Error>>): P<Array<A> | Error> => {
  return o_ => {
    var o = x => ((o = noop), onNextFrame(() => o_(x)))
    const rays: Array<CB<A>> = []
    try {
      pith(r => {
        rays.push(r)
      })
    } catch (err) {
      return o(err)
    }
    var left = rays.length
    if (!left) return o([])
    const rez: Array<A> = new Array(left)
    try {
      rays.forEach((cbf, i) => {
        var firstCall = true
        cbf(x => {
          if (!firstCall) return
          firstCall = false
          left--
          if (x instanceof Error) o(x)
          else {
            rez[i] = x
            if (!left) o(rez)
          }
        })
      })
    } catch (err) {
      return o(err)
    }
    o = x => ((o = noop), o_(x))
  }
}

export const seqBark = <A>(pith: P<P<A | Error>>): P<A | Error> => {
  return o_ => {
    var o = x => onNextFrame(() => o_(x))
    const rays: Array<CB<A>> = []
    try {
      pith(r => {
        rays.push(r)
      })
    } catch (err) {
      return o(err)
    }
    if (rays.length === 0) return
    var a: A
    const runNext = () => {
      const cbf = rays.shift()
      var firstCall = true
      try {
        cbf(x => {
          if (!firstCall) return
          firstCall = false
          if (x instanceof Error) o(x)
          else if (rays.length > 0) runNext()
          else o(x)
        })
      } catch (err) {
        o(err)
      }
    }
    runNext()
    o = o_
  }
}

declare var bark: <A>(pith: (o: (CB<A>) => void) => void) => CB<A>
bark(o => {
  o(cb => {
    cb(1)
  })
  o(cb => {
    cb(2)
  })
})((err: Error | number) => {})
