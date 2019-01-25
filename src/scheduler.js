//@flow strict
export type O = (a: Schedule | number, b: ?Schedule) => void
export type Schedule = (time: number) => void

export function mkRun<H>(
  tf: () => number,
  setRunat: (f: () => void, runAt: number) => H
): O {
  let currentTime = -1
  let line: Array<[number, Array<Schedule>]> = []
  let nextRun = -1
  let handle: ?H = null
  const append = (t, s) => {
    const i = findAppendPosition(t, line)
    if (i > -1 && line[i][0] === t) {
      line[i][1].push(s)
    } else {
      line.splice(i + 1, 0, [t, [s]])
    }
  }
  const atNextRun = () => {
    if (line.length === 0) {
      handle = null
      return
    }
    currentTime = nextRun
    const ap = findAppendPosition(currentTime, line)
    if (ap > -1) {
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) {
        let [t, ss] = line_[i]
        for (let j = 0, l = ss.length; j < l; j++) ss[j](t)
      }
    }
    nextRun = line.length > 0 ? line[0][0] : currentTime
    handle = setRunat(atNextRun, nextRun)
  }
  return (a, b) => {
    if (handle == null) {
      currentTime = tf()
      nextRun = currentTime
      handle = setRunat(atNextRun, currentTime)
    }
    if (typeof a === "number" && typeof b === "function") {
      append(currentTime + a, b)
    } else {
      if (typeof a === "function") a(currentTime)
      if (typeof b === "function") b(currentTime)
    }
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
  throw new Error("never")
}
