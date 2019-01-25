//@flow strict
export type O = (Schedule | number, ?Schedule) => void
export type Schedule = (o: O, t: number) => void

export function mkRun<H>(
  tf: () => number,
  setRunat: (f: () => void, runAt: number) => H
): O {
  let currentTime = -1
  let line: Array<[number, Schedule]> = []
  let nextRun = -1
  let handle: ?H = null
  const append = (t, s) => {
    const i = findAppendPosition(t, line)
    if (i > -1 && line[i][0] === t) {
      line[i][1] = mappend(line[i][1], s)
    } else {
      line.splice(i + 1, 0, [t, s])
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
      for (let i = 0; i <= ap; i++) runNow(append, line_[i][0], line_[i][1])
    }
    nextRun = line.length > 0 ? line[0][0] : currentTime
    handle = setRunat(atNextRun, nextRun)
  }
  return (a, b) => {
    const pith =
      typeof a === "function"
        ? typeof b === "function"
          ? (o, t) => o(a, b)
          : a
        : typeof b === "function"
        ? (o, t) => o(a + t, b)
        : () => {}
    if (handle == null) {
      currentTime = tf()
      nextRun = currentTime
      handle = setRunat(atNextRun, currentTime)
    }
    runNow(append, currentTime, pith)
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

function runNow(
  o: (number, Schedule) => void,
  t: number,
  pith: Schedule
): void {
  pith((a, b) => {
    if (typeof a === "number") {
      if (b) o(t + a, b)
    } else {
      runNow(o, t, a)
    }
  }, t)
}

function mappend(l: Schedule, r: Schedule): Schedule {
  return (o, t) => {
    l(o, t)
    r(o, t)
  }
}
