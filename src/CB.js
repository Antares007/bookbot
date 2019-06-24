// @flow strict

export type CB<+A> = ((error: ?Error, value: A) => void) => void
export type CPith<+A> = (o: (CB<A>) => void) => void

export const onNextFrame = (f: () => void): void => {
  setTimeout(f, 0)
}

export class RunCBError extends Error {
  innerError: Error
  constructor(message: string, innerError: Error) {
    super(message)
    this.innerError = innerError
  }
}

export const parBark = <A>(pith: CPith<A>): CB<Array<A>> => {
  return o_ => {
    const noop = (_1, _2) => {}
    var o = (err, a) => ((o = noop), onNextFrame(() => o_(err, a)))
    const rays: Array<CB<A>> = []
    try {
      pith(r => {
        rays.push(r)
      })
    } catch (err) {
      return o(err, [])
    }
    var left = rays.length
    if (!left) return o(null, [])
    const rez: Array<A> = new Array(left)
    try {
      rays.forEach((cbf, i) => {
        var firstCall = true
        cbf((mErr, mA) => {
          if (firstCall) {
            firstCall = false
            rez[i] = mA
            if (mErr) o(mErr, rez)
            else if (!--left) o(null, rez)
          }
        })
      })
    } catch (err) {
      return o(err, [])
    }
    o = (e, a) => ((o = noop), o_(e, a))
  }
}

export const seqBark = <A>(pith: CPith<?A>): CB<?A> => {
  return o_ => {
    var o = (err, a) => onNextFrame(() => o_(err, a))
    const rays: Array<CB<?A>> = []
    try {
      pith(r => {
        rays.push(r)
      })
    } catch (err) {
      return o(err)
    }
    if (rays.length === 0) return o()
    var a: ?A
    const runNext = () => {
      const cbf = rays.shift()
      var firstCall = true
      try {
        cbf((mErr, mA) => {
          if (firstCall) {
            firstCall = false
            a = mA
            if (mErr) o(mErr, a)
            else if (rays.length > 0) runNext()
            else o(void 0, a)
          }
        })
      } catch (err) {
        o(new RunCBError(cbf.toString(), err), a)
      }
    }
    runNext()
    o = o_
  }
}
