//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/scheduler.js"

export function t(assert: A & Test): void {
  const actual = { t: [], l: [], frame: 0 }
  const expected = {
    frame: 3,
    t: [30, 60, 90],
    l: [["A", 30, 0], ["B", 30, 0], ["C", 60, 2], ["D", 90, 3], ["E", 90, 3]]
  }
  s.run(
    () => 30,
    (f, at) => {
      actual.t.push(at)
      Promise.resolve().then(() => {
        actual.frame++
        f()
      })
    }
  )((o, t) => {
    actual.l.push(["A", t, actual.frame])
    o((o, t) => {
      actual.l.push(["B", t, actual.frame])
      o(60, (o, t) => {
        actual.l.push(["D", t, actual.frame])
      })
    })
    o(30, (o, t) => {
      actual.l.push(["C", t, actual.frame])
      o(30, (o, t) => {
        actual.l.push(["E", t, actual.frame])
        assert.deepStrictEqual(actual, expected)
      })
    })
  })
}
