// @flow strict

import type { Disposable } from './disposable'
import type { TimePoint, Scheduler$O } from './scheduler2'
import { delay } from './scheduler2'

type S$Pith<A> = ((S$O<A> | Scheduler$O) => void) => Disposable
type S<A> = { type: 'stream', pith: S$Pith<A> }

export type S$O<A> =
  | { type: 'event', v: A }
  | { type: 'end' }
  | { type: 'error', v: Error }

export const event = <A>(t: TimePoint, v: A): S$O<A> => ({
  type: 'event',
  t,
  v
})
export const end = <A>(t: TimePoint): S$O<A> => ({ type: 'end', t })
export const error = <A>(t: TimePoint, v: Error): S$O<A> => ({
  type: 'error',
  t,
  v
})
export { delay }

export const run = <A>(
  o: (S$O<A> & { t: TimePoint }) => void,
  v: S<A>
): Scheduler$O => {
  return delay(0, (oS, now) => {
    let see = v.pith(e => {
      if (e.type === 'event') {
        var see = Object.assign({}, e, { t: now() })
        o(see)
      }
    })
  })
}

export const Of = <A>(pith: S$Pith<A>): S<A> => ({
  type: 'stream',
  pith
})
export const at = <A>(a: A, delay_: number = 0): S<A> =>
  Of(o => {
    return { dispose() {} }
  })

// {
//
//   return new S((o, schdlr) => {
//     var active = true
//     schdlr.delay(delay_, t => {
//       if (active) o(event(t, a))
//       if (active) o(end(t))
//     })
//     return {
//       dispose() {
//         active = false
//       }
//     }
//   })
// }
