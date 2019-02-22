// @flow strict
import type { Disposable } from './disposable'

export opaque type Scheduler$Pith = (
  (Scheduler$O) => void,
  number
) => ?Disposable
export opaque type Scheduler$O =
  | { type: 'now', pith: Scheduler$Pith }
  | { type: 'delay', delay: number, pith: Scheduler$Pith }

export const now = (pith: Scheduler$Pith): Scheduler$O => ({
  type: 'now',
  pith
})
export const delay = (delay: number, pith: Scheduler$Pith): Scheduler$O => ({
  type: 'delay',
  delay,
  pith
})

export function run(i: Scheduler$O): ?Disposable {
  if (i.type === 'now') return
  return { dispose() {} }
}
