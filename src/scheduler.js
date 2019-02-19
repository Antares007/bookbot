// @flow strict
import type { Disposable } from './disposable'
import * as assert from 'assert'

export opaque type TimePoint: number = number

export class Scheduler {
  nowf: () => number
  delayf: (delay: number, f: () => void) => Disposable
  line: Array<[number, Array<?(TimePoint) => void>]>
  nowT: number
  nexT: number
  d: ?Disposable
  constructor(
    nowf: () => number,
    delay: (delay: number, f: () => void) => Disposable
  ) {
    this.nowf = nowf
    this.delayf = delay
    this.line = []
    this.nowT = -Infinity
    this.nexT = +Infinity
    this.d = null
  }
  now(): TimePoint {
    if (this.nowT !== this.nexT) {
      this.d && this.d.dispose()
      this.d = this.delayf(0, run.bind(this))
      var now = this.nowf()
      if (this.nowT > now) now = this.nowT
      if (this.nexT < now) now = this.nexT
      this.nowT = this.nexT = now
    }
    return this.nowT
  }
  delay(delay: number, f: TimePoint => void): Disposable {
    const at = delay < 0 ? this.now() : this.now() + delay
    const ap = findAppendPosition(at, this.line)
    var li = this.line[ap]
    if (ap === -1 || li[0] !== at) {
      li = [at, []]
      this.line.splice(ap + 1, 0, li)
    }
    const index = li[1].push(f) - 1
    return {
      dispose() {
        li[1][index] = null
      }
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
        const timeoutID = setTimeout(() => ((t += d), f()), 0)
        return {
          dispose() {
            clearTimeout(timeoutID)
          }
        }
      }
    )
  }
}

export const defaultScheduler: Scheduler = new Scheduler(
  Date.now.bind(Date),
  (d, f) => {
    const timeoutID = setTimeout(f, d)
    return {
      dispose() {
        clearTimeout(timeoutID)
      }
    }
  }
)

function run() {
  this.nowT = this.nexT
  while (true) {
    const ap = findAppendPosition(this.nowT, this.line)
    if (ap === -1) break
    const line_ = this.line
    this.line = ap === this.line.length - 1 ? [] : this.line.slice(ap + 1)
    for (var i = 0; i <= ap; i++) {
      const [t, fs] = line_[i]
      for (var f of fs) f && f(t)
    }
  }
  if (this.line.length === 0) {
    this.nexT = +Infinity
    this.d = null
  } else {
    this.nexT = this.line[0][0]
    assert.ok(this.nexT > this.nowT)
    this.d = this.delayf(this.nexT - this.nowT, run.bind(this))
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
