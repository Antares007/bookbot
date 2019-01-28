//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/scheduler.js"

export function t(assert2: A): void {
  const actual = { t: [], l: [], frame: 0 }
  const expected = {
    frame: 3,
    t: [30, 60, 90],
    l: [[30, 0], [30, 0], [60, 2], [90, 3], [90, 3]]
  }
  let ctime = 30
  const oS = s.mkScheduler(
    () => ctime,
    (f, delay) => {
      ctime += delay
      actual.t.push(ctime)
      return Promise.resolve().then(() => {
        actual.frame++
        f()
      })
    }
  )
  const o = (a, b) => {
    const pushTime = p => t => {
      actual.l.push([t, actual.frame])
      p(t)
    }
    if (typeof a === "number" && typeof b === "function") {
      oS(a, pushTime(b))
    } else {
      if (typeof a === "function") oS(pushTime(a))
      if (typeof b === "function") oS(pushTime(b))
    }
  }
  o(t => {
    o(t => {
      o(60, t => {})
    })
    o(30, t => {
      o(30, t => assert2.deepStrictEqual(actual, expected))
    })
  })
  assert2.deepStrictEqual(actual, {
    frame: 0,
    t: [30],
    l: [[30, 0], [30, 0]]
  })
}

export function t2(assert2: A): void {
  const actual = { t: [], l: [], frame: 0 }
  const expected = {
    frame: 1,
    t: [0],
    l: [[30, 0], [30, 1], [30, 1]]
  }

  let ctime = 30
  const oS = s.mkScheduler(
    () => ctime,
    (f, at) => {
      ctime += at
      actual.t.push(at)
      return Promise.resolve().then(() => {
        actual.frame++
        f()
      })
    }
  )
  const o = (a, b) => {
    const pushTime = p => t => {
      actual.l.push([t, actual.frame])
      p(t)
    }
    if (typeof a === "number" && typeof b === "function") {
      oS(a, pushTime(b))
    } else {
      if (typeof a === "function") oS(pushTime(a))
      if (typeof b === "function") oS(pushTime(b))
    }
  }

  o(t => {
    o(0, t => {
      o(0, t => {
        assert2.deepStrictEqual(actual, expected)
      })
    })
  })
  assert2.deepStrictEqual(actual, {
    frame: 0,
    t: [0],
    l: [[30, 0]]
  })
}
