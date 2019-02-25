// @flow strict
import type { Disposable } from './disposable'

export opaque type TimePoint: number = number

export type Scheduler$Pith = (
  (Scheduler$O) => void,
  () => TimePoint
) => ?Disposable

export type Scheduler$O = {
  type: 'delay',
  delay: number,
  pith: Scheduler$Pith
}

export const delay = (delay: number, pith: Scheduler$Pith): Scheduler$O => ({
  type: 'delay',
  delay,
  pith
})

export function run(v: Scheduler$O): Disposable {
  return { dispose() {} }
}

let see = run(
  delay(0, (o, now) => {
    o(delay(0, (o, now) => {}))
  })
)
