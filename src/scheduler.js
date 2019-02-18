// @flow strict
import type { Disposable } from './disposable'
import * as assert from 'assert'

export opaque type TimePoint: number = number

export class Scheduler {
  nowf: () => number
  delayf: (delay: number, f: () => void) => void
  line: Array<[number, (TimePoint) => void]>
  nowT: number
  nexT: number
  constructor(
    nowf: () => number,
    delay: (delay: number, f: () => void) => void
  ) {
    this.nowf = nowf
    this.delayf = delay
    this.line = []
    this.nowT = -Infinity
    this.nexT = +Infinity
  }
  now(): TimePoint {
    if (this.nowT !== this.nexT) {
      this.delayf(0, run.bind(this))
      var now = this.nowf()
      if (this.nowT > now) now = this.nowT
      if (this.nexT < now) now = this.nexT
      this.nowT = this.nexT = now
    }
    return this.nowT
  }
  delay(delay: number, f: TimePoint => void) {
    const at = delay < 0 ? this.now() : this.now() + delay
    const ap = findAppendPosition(at, this.line)
    const li = this.line[ap]
    if (ap > -1 && li[0] === at) {
      li[1] = (l => t => (l(t), f(t)))(li[1])
    } else {
      this.line.splice(ap + 1, 0, [at, f])
    }
  }
  local(): Scheduler {
    const t0 = this.now()
    return new Scheduler(() => this.now() - t0, this.delay.bind(this))
  }
  static asap(start: number): Scheduler {
    var t = start
    return new Scheduler(
      () => t,
      (d, f) => {
        Promise.resolve(d).then(d => ((t += d), f()))
      }
    )
  }
}

export const defaultScheduler: Scheduler = new Scheduler(
  Date.now.bind(Date),
  (d, f) => setTimeout.call(null, f, d)
)

function run() {
  this.nowT = this.nexT
  while (true) {
    const ap = findAppendPosition(this.nowT, this.line)
    if (ap === -1) break
    const line_ = this.line
    this.line = ap === this.line.length - 1 ? [] : this.line.slice(ap + 1)
    for (let i = 0; i <= ap; i++) line_[i][1](line_[i][0])
  }
  if (this.line.length === 0) {
    this.nexT = +Infinity
  } else {
    this.nexT = this.line[0][0]
    assert.ok(this.nexT > this.nowT)
    this.delayf(this.nexT - this.nowT, run.bind(this))
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
