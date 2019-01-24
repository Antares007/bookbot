//@flow
export type Schedule = (
  (Schedule | number, ?Schedule) => void,
  t: number
) => void

import * as tl from "../src/timeline.js"

function run(o: (number, Schedule) => void, t: number, pith: Schedule): void {
  pith((a, b) => {
    if (typeof a === "number") {
      if (b) o(t + a, b)
    } else {
      run(o, t, a)
    }
  }, t)
}

export function mappend(l: Schedule, r: Schedule): Schedule {
  return (o, t) => {
    l(o, t)
    r(o, t)
  }
}

export function mkScheduler(
  tf: () => number,
  nextFrame: (f: () => void) => void
): (s: Schedule) => void {
  let current = null
  let active = false
  let now = -1
  const add = timeline => {
    if (current && timeline) {
      current = tl.mappend(mappend, current, timeline)
    } else if (timeline) {
      current = timeline
    }
  }
  const onNextFrame = () => {
    if (!current) {
      active = false
      return
    }
    now = tf()
    const cur = current
    current = null
    add(
      tl.fromPith(mappend, o =>
        tl.runTo(
          v => run((t, pith) => o([t, pith]), v[0], v[1]),
          mappend,
          now,
          cur
        )
      )
    )
    nextFrame(onNextFrame)
  }
  return pith => {
    if (!active) {
      nextFrame(onNextFrame)
      active = true
      now = tf()
    }
    add(tl.fromPith(mappend, o => run((t, s) => o([t, s]), now, pith)))
  }
}
