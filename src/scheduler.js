// @flow strict
import * as Disposable from './Disposable'

export opaque type TimePoint: number = number

const nowf = () => Date.now()
const delayf = (f: () => void, d = 0) => {
  const timeoutID = setTimeout(f, d)
  return Disposable.create(() => clearTimeout(timeoutID))
}

var line: Array<[number, Array<?(TimePoint) => void>]> = []
var nowT = -Infinity
var nexT = +Infinity
var d: ?Disposable.T = null

export const now = (): TimePoint => {
  if (nowT !== nexT) {
    d && d.dispose()
    d = delayf(run, 0)
    var now = nowf()
    if (nowT > now) now = nowT
    if (nexT < now) now = nexT
    nowT = nexT = now
  }
  return nowT
}

export const delay = (f: () => void, delay: number = 0): Disposable.T => {
  const at = delay < 0 ? now() : now() + delay
  const ap = findAppendPosition(at, line)
  var li = line[ap]
  if (ap === -1 || li[0] !== at) {
    li = [at, []]
    line.splice(ap + 1, 0, li)
  }
  const index = li[1].push(f) - 1
  return Disposable.create(() => {
    li[1][index] = null
  })
}

function run() {
  nowT = nexT
  while (true) {
    const ap = findAppendPosition(nowT, line)
    if (ap === -1) break
    const line_ = line
    line = ap === line.length - 1 ? [] : line.slice(ap + 1)
    for (var i = 0; i <= ap; i++) {
      const [t, fs] = line_[i]
      for (var f of fs) f && f(t)
    }
  }
  if (line.length === 0) {
    nexT = +Infinity
    d = null
  } else {
    nexT = line[0][0]
    d = delayf(run, nexT - nowT)
  }
}

export function findAppendPosition<T>(
  n: number,
  line: Array<[number, T]>
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
