//@flow strict
export type Schedule = (
  o: (Schedule | number, ?Schedule) => void,
  t: number
) => void

export function run(
  tf: () => number,
  nextFrame: (f: () => void) => void
): (pith: Schedule) => void {
  let line: Array<[number, Schedule]> = []
  let now = -1
  let active = false
  const append = (t, s) => {
    const i = findAppendPosition(t, line)
    if (i > -1 && line[i][0] === t) {
      line[i][1] = mappend(line[i][1], s)
    } else {
      line.splice(i + 1, 0, [t, s])
    }
  }
  const onNextFrame = () => {
    now = tf()
    while (true) {
      const ap = findAppendPosition(now, line)
      if (ap === -1) break
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) runNow(append, line_[i][0], line_[i][1])
    }
    if (line.length > 0) nextFrame(onNextFrame)
  }
  return pith => {
    if (!active) {
      active = true
      now = tf()
      nextFrame(onNextFrame)
    }
    runNow(append, now, pith)
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
