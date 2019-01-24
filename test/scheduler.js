//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/scheduler.js"

export function t(assert: A & Test): void {
  let t = [30, 60, 90]
  const scheduler = s.mkScheduler(
    () => t.shift(),
    f => (Promise.resolve().then(f), void 0)
  )
  const line: Array<[number, number]> = []

  scheduler((o, t) => {
    line.push([0, t])
    o((o, t) => {
      line.push([1, t])
      o(60, (o, t) => {
        line.push([2, t])
      })
    })
    o(30, (o, t) => {
      line.push([3, t])
      o(30, (o, t) => {
        line.push([4, t])
        assert.deepStrictEqual(line, [
          [0, 30],
          [1, 30],
          [3, 60],
          [2, 90],
          [4, 90]
        ])
      })
    })
  })
}
