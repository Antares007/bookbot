//@flow strict
export type Scheduler = (a: ScheduleAction | number, b: ?ScheduleAction) => void
export type ScheduleAction = (time: number) => void

export function local(lt: number, schedule: Scheduler): Scheduler {
  return (a, b) =>
    schedule(t => {
      const offset = lt - t
      if (typeof a === "number" && typeof b === "function") {
        schedule(a, t => b(t + offset))
      } else {
        if (typeof a === "function") schedule(t => a(t + offset))
        if (typeof b === "function") schedule(t => b(t + offset))
      }
    })
}

export function mkScheduler<H>(
  tf: () => number,
  setTimeout: (f: () => void, delay: number) => H
): Scheduler {
  let currentTime: number = -1
  let line: Array<[number, Array<ScheduleAction>]> = []
  return schedule
  function schedule(a, b) {
    if (currentTime === -1) {
      currentTime = tf()
      setTimeout(onTimeout, 0)
    }
    if (typeof a === "number" && typeof b === "function") {
      const t = currentTime + a
      const i = findAppendPosition(t, line)
      const li = line[i]
      if (i > -1 && li[0] === t) li[1].push(b)
      else line.splice(i + 1, 0, [t, [b]])
    } else {
      if (typeof a === "function") a(currentTime)
      if (typeof b === "function") b(currentTime)
    }
  }
  function onTimeout() {
    if (line.length === 0) {
      currentTime = -1
      return
    }
    currentTime = tf()
    runUntil()
    setTimeout(onTimeout, line.length > 0 ? Math.max(0, line[0][0] - tf()) : 0)
  }
  function runUntil() {
    while (true) {
      const ap = findAppendPosition(currentTime, line)
      if (ap === -1) break
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) {
        let [t, acts] = line_[i]
        for (let act of acts) act(t)
      }
    }
  }
  function append(t, sr) {
    const i = findAppendPosition(t, line)
    const li = line[i]
    if (i > -1 && li[0] === t) {
      li[1].push(sr)
    } else {
      line.splice(i + 1, 0, [t, [sr]])
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
