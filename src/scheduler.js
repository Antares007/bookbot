//@flow strict
export type Scheduler = (number | ScheduleAction, ?ScheduleAction) => void
export type ScheduleAction = number => void

export function mkScheduler(
  tf: () => number,
  setTimeout: (f: () => void, delay: number) => void
): Scheduler {
  let p = Promise.resolve()
  const currentTime: () => number = (() => {
    let t = -1
    const reset = () => (t = -1)
    return () => {
      if (t !== -1) return t
      t = tf()
      p = p.then(reset)
      return t
    }
  })()

  let line: Array<[number, ScheduleAction]> = []

  return schedule

  function schedule(a, b) {
    if (typeof a === 'number' && typeof b === 'function') {
      const t = currentTime() + Math.max(0, a)
      if (line.length === 0) p = p.then(onTimeout)
      const ap = findAppendPosition(t, line)
      const li = line[ap]
      if (ap > -1 && li[0] === t)
        li[1] = (l => t => {
          l(t)
          b(t)
        })(li[1])
      else line.splice(ap + 1, 0, [t, b])
    } else {
      if (typeof a === 'function') a(currentTime())
      if (typeof b === 'function') b(currentTime())
    }
  }

  function onTimeout() {
    const t = currentTime()
    while (true) {
      const ap = findAppendPosition(t, line)
      if (ap === -1) break
      const line_ = line
      line = ap === line.length - 1 ? [] : line.slice(ap + 1)
      for (let i = 0; i <= ap; i++) line_[i][1](line_[i][0])
    }
    if (line.length === 0) return
    setTimeout(onTimeout, Math.max(0, line[0][0] - tf()))
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
  throw new Error('never')
}
