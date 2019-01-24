//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/scheduler.js"

export function t(assert: A & Test): void {
  const actual = { t: [30, 99], l: [], i: 0 }
  const expected = {
    i: 1,
    t: [],
    l: [[0, 30, 0], [1, 30, 0], [3, 60, 1], [2, 90, 1], [4, 90, 1]]
  }
  s.run(
    actual.t.shift(),
    f => {
      actual.i++
      f(actual.t.shift())
    },
    (o, t) => {
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
    }
  )
}
