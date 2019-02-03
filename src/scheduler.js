//@flow strict
import { defer } from './defer'
export opaque type TimePoint: number = number
export type Scheduler = (number | ScheduleAction, ?ScheduleAction) => void
export type ScheduleAction = number => void

export function mkScheduler(
  tf: () => number,
  setTimeout: (f: () => void, delay: number) => void
): Scheduler {
  const now = mkPureNow(tf)
  let line: Array<[number, ScheduleAction]> = []

  return schedule

  function schedule(a, b) {
    const currentTime = now()
    if (typeof a === 'number' && typeof b === 'function') {
      if (line.length === 0) defer(onTimeout)
      const t = currentTime + (a < 0 ? 0 : a)
      const ap = findAppendPosition(t, line)
      const li = line[ap]
      if (ap > -1 && li[0] === t)
        li[1] = (l => t => {
          l(t)
          b(t)
        })(li[1])
      else line.splice(ap + 1, 0, [t, b])
    } else {
      if (typeof a === 'function') a(currentTime)
      if (typeof b === 'function') b(currentTime)
    }
  }
  function onTimeout() {
    const currentTime = now()
    while (true) {
      const ap = findAppendPosition(currentTime, line)
      if (ap === -1) break
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) line_[i][1](line_[i][0])
    }
    if (line.length === 0) return
    const delay = line[0][0] - tf()
    if (delay <= 0) defer(onTimeout)
    else setTimeout(onTimeout, delay)
  }
}

function mkPureNow(tf: () => number): () => TimePoint {
  let currentTime = -1
  const reset = () => {
    currentTime = -1
  }
  return () => {
    if (currentTime !== -1) return currentTime
    defer(reset)
    currentTime = tf()
    return currentTime
  }
}

function findAppendPosition<T>(n: number, line: Array<[number, T]>): number {
  var l = 0
  var r = line.length
  while (true) {
    if (l < r) {
      const m = ~~((l + r) / 2) | 0
      if (line[m][0] > n) {
        r = m
        continue
      } else {
        l = m + 1
        continue
      }
    } else {
      return l - 1
    }
  }
  throw new Error('never')
}
