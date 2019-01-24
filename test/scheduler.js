//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/scheduler.js"

export function t(assert: A & Test): void {
  const actual = { t: [30, 60, 90, 99], l: [], i: 0 }
  const expected = {
    i: 2,
    t: [99],
    l: [[0, 30, 0], [1, 30, 0], [3, 60, 1], [2, 90, 2], [4, 90, 2]]
  }
  s.run(
    () => actual.t.shift(),
    f => {
      Promise.resolve().then(() => (actual.i++, f()))
    }
  )((o, t) => {
    actual.l.push([0, t, actual.i])
    o((o, t) => {
      actual.l.push([1, t, actual.i])
      o(60, (o, t) => {
        actual.l.push([2, t, actual.i])
      })
    })
    o(30, (o, t) => {
      actual.l.push([3, t, actual.i])
      o(30, (o, t) => {
        actual.l.push([4, t, actual.i])
        assert.deepStrictEqual(actual, expected)
      })
    })
  })
}
