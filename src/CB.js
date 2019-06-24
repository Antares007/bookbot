// @flow strict

export type CB<+A> = ((error: ?Error, value: ?A) => void) => void
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

export const pbark = <A>(pith: CPith<A>): CB<A> => {
  return cb => {}
}

export const seqBark = <A>(pith: CPith<A>): CB<A> => {
  return o_ => {
    var o = (err, a) => onNextFrame(() => o_(err, a))
    const rays: Array<CB<A>> = []
    pith(r => {
      rays.push(r)
    })
    if (rays.length === 0) o()
    else {
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
}

import * as fs from 'fs'

const see: string => string => CB<Buffer> = rootPath => hash =>
  seqBark(o => {
    var mbuffer
    o(cb => {
      fs.readFile('', (err, buffer) => {
        if (err) cb(err)
        else mbuffer = buffer
      })
    })
    o(cb => {
      if (!mbuffer) cb(new Error('never'))
      mbuffer
    })
  })

see('rootPath')('hash')((err, buffer) => {
  console.log({ err, buffer })
})
