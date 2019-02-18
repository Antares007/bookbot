// @flow strict
import type { Disposable } from './disposable'

export opaque type TimePoint: number = number
export type scheduler$O =
  | { type: 'now', action: TimePoint => void }
  | { type: 'delay', delay: number, action: TimePoint => void }

export function now(action: TimePoint => void): scheduler$O {
  return { type: 'now', action }
}

export function delay(delay: number, action: TimePoint => void): scheduler$O {
  return { type: 'delay', delay, action }
}
export function local(o: scheduler$O => void): scheduler$O => void {
  var offset = 0
  o(
    now(t0 => {
      offset = 0 - t0
    })
  )
  return i => {
    const action = t => i.action(t + offset)
    if (i.type === 'now') {
      o({ type: 'now', action })
    } else {
      o({ type: 'delay', delay: i.delay, action })
    }
  }
}

function scheduler(speed: number = 1): scheduler$O => void {
  var line = []
  var nowT = -Infinity
  var nexT = +Infinity
  var timeoutID: ?TimeoutID = null
  return i => {
    if (timeoutID == null) {
      nowT = nexT = Math.max(nowT, Math.min(nexT, Date.now()))
      timeoutID = setTimeout(run, 0)
    }
    if (i.type === 'now') {
      i.action(nowT)
    } else {
      const at = (i.delay < 0 ? 0 : i.delay) + nowT
      const ap = findAppendPosition(at, line)
      const li = line[ap]
      if (ap > -1 && li[0] === at) {
        li[1] = (l => t => (l(t), i.action(t)))(li[1])
      } else {
        line.splice(ap + 1, 0, [at, i.action])
      }
    }
  }
  function run() {
    nowT = nexT
    while (true) {
      const ap = findAppendPosition(nowT, line)
      if (ap === -1) break
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) line_[i][1](line_[i][0])
    }
    if (line.length === 0) {
      nexT = +Infinity
      timeoutID = null
    } else {
      nexT = line[0][0]
      timeoutID = setTimeout(run, nowT - nexT)
    }
  }
}

export class Scheduler {
  o: scheduler$O => void
  constructor(o: scheduler$O => void) {
    this.o = o
  }
  now(offset?: number): TimePoint {
    var tp: number = 0
    this.o({ type: 'now', action: t => ((tp = t), void 0) })
    return tp + (offset || 0)
  }
  schedule(delay: number, action: TimePoint => void) {
    this.o({ type: 'delay', delay: delay < 0 ? 0 : delay, action })
  }
  scheduleD(
    delay: number,
    f: (TimePoint, { active: boolean }) => void
  ): Disposable {
    const ref = { active: true }
    this.schedule(delay, t => {
      if (ref.active) f(t, ref)
    })
    return {
      dispose() {
        ref.active = false
      }
    }
  }
  local(t0: number = 0): Scheduler {
    return new Local(t0 - this.now(), this.o)
  }
  static default(speed: number): Scheduler {
    return new Scheduler(scheduler(speed))
  }
}

class Local extends Scheduler {
  constructor(offset: number, o: scheduler$O => void) {
    super(i => {
      const action = t => i.action(t + offset)
      if (i.type === 'now') {
        o({ type: 'now', action })
      } else {
        o({ type: 'delay', delay: i.delay, action })
      }
    })
  }
  local(): Scheduler {
    return this
  }
}

function findAppendPosition<T>(
  n: TimePoint,
  line: Array<[TimePoint, T]>
): number {
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
//const o = local(scheduler(1))
//const rec = d => t => {
//  console.log(t)
//  if (d > 0) o(delay(1000, rec(d - 1)))
//}
//o(now(rec(9)))
