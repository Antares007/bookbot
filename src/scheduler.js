// @flow strict
import type { Disposable } from './disposable'

export opaque type TimePoint: number = number

export class Scheduler {
  now: (offset?: number) => TimePoint
  setTimeout: (() => void, number) => void
  line: Array<[TimePoint, (TimePoint) => void]>
  constructor(
    now: (offset?: number) => TimePoint,
    setTimeout: (() => void, number) => void
  ) {
    this.now = now
    this.setTimeout = setTimeout
    this.line = []
  }
  schedule(delay: number, action: TimePoint => void) {
    if (this.line.length === 0) this.setTimeout(onTimeout.bind(this), 0)
    const at = this.now() + (delay < 0 ? 0 : delay)
    const ap = findAppendPosition(at, this.line)
    const li = this.line[ap]
    if (ap > -1 && li[0] === at) {
      li[1] = (l => t => (l(t), action(t)))(li[1])
    } else {
      this.line.splice(ap + 1, 0, [at, action])
    }
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
  relative(t0: TimePoint): Scheduler {
    if (t0 === this.now()) return this
    return new Scheduler(
      n => (n == null ? 0 : n) + this.now() - t0,
      this.setTimeout
    )
  }
  local(): Scheduler {
    return new Local(this.now, this.setTimeout)
  }
  static default(): Scheduler {
    let currentTime = -1
    const reset = () => {
      currentTime = -1
    }
    return new Scheduler(
      n => {
        if (currentTime !== -1) return n == null ? currentTime : currentTime + n
        setTimeout(reset, 0)
        currentTime = Date.now()
        return n == null ? currentTime : currentTime + n
      },
      (f, d) => {
        setTimeout(f, d)
      }
    )
  }
  static test(startTime: number): Scheduler {
    let t = startTime
    return new Scheduler(
      () => t,
      (f, d) => {
        t += d
        Promise.resolve().then(f)
      }
    )
  }
}
class Local extends Scheduler {
  constructor(now: () => TimePoint, setTimeout: (() => void, number) => void) {
    const t0 = now()
    super(() => now() - t0, setTimeout)
  }
  local(): Scheduler {
    if (this instanceof Local) return this
    return super.local()
  }
}
function onTimeout() {
  while (true) {
    const ap = findAppendPosition(this.now(), this.line)
    if (ap === -1) break
    const line_ = this.line
    this.line = ap === this.line.length - 1 ? [] : this.line.slice(ap + 1)
    for (let i = 0; i <= ap; i++) line_[i][1](line_[i][0])
  }
  if (this.line.length === 0) return
  const delay = this.line[0][0] - this.now()
  if (delay <= 0) setTimeout(onTimeout.bind(this), 0)
  else this.setTimeout(onTimeout.bind(this), delay)
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
