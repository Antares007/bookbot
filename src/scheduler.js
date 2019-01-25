//@flow strict
export type O = (a: Schedule | number, b: ?Schedule) => void
export type Schedule = (time: number) => void

export function mkRun<H>(
  tf: () => number,
  setRunat: (f: () => void, runAt: number) => H
): O {
  let currentTime: number = -1
  let line: Array<[number, Schedule]> = []
  const append = (t, s) => {
    const i = findAppendPosition(t, line)
    if (i > -1 && line[i][0] === t) {
      const sl = line[i][1]
      line[i][1] = t => {
        sl(t)
        s(t)
      }
    } else {
      line.splice(i + 1, 0, [t, s])
    }
  }
  const atNextRun = () => {
    if (line.length === 0) {
      currentTime = -1
      return
    }
    const ap = findAppendPosition(currentTime, line)
    if (ap > -1) {
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) {
        line_[i][1](line_[i][0])
      }
    }
    currentTime = line.length > 0 ? line[0][0] : currentTime
    setRunat(atNextRun, currentTime)
  }
  return (a, b) => {
    if (currentTime === -1) {
      currentTime = tf()
      setRunat(atNextRun, currentTime)
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
