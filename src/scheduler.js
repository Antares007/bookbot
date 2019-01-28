//@flow strict
export type O = (a: Schedule | number, b: ?Schedule) => void
export type Schedule = (time: number) => void

export function mkScheduler<H>(
  tf: () => number,
  setTimeout: (f: () => void, delay: number) => H
): O {
  let currentTime: number = -1
  let line: Array<[number, Schedule]> = []
  const append = (t, sr) => {
    const i = findAppendPosition(t, line)
    const li = line[i]
    if (i > -1 && li[0] === t) {
      const sl = li[1]
      li[1] = t => (sl(t), sr(t))
    } else {
      line.splice(i + 1, 0, [t, sr])
    }
  }
  const onTimeout = () => {
    if (line.length === 0) {
      currentTime = -1
      return
    }
    currentTime = tf()
    while (true) {
      const ap = findAppendPosition(currentTime, line)
      if (ap === -1) break
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) {
        line_[i][1](line_[i][0])
      }
    }
    setTimeout(onTimeout, line.length > 0 ? Math.max(0, line[0][0] - tf()) : 0)
  }
  return (a, b) => {
    if (currentTime === -1) {
      currentTime = tf()
      setTimeout(onTimeout, 0)
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
