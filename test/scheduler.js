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
  const so = s.mkRun(
    () => 30,
    (f, at) => {
      actual.t.push(at)
      return Promise.resolve().then(() => {
        actual.frame++
        f()
      })
    }
  )
  so(t => {
    actual.l.push(["A", t, actual.frame])
    so(t => {
      actual.l.push(["B", t, actual.frame])
      so(60, t => {
        actual.l.push(["D", t, actual.frame])
      })
    })
    so(30, t => {
      actual.l.push(["C", t, actual.frame])
      so(30, t => {
        actual.l.push(["E", t, actual.frame])
        assert.deepStrictEqual(actual, expected)
      })
    })
  })
}
