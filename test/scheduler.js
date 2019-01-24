//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/scheduler.js"

export function t(assert: A & Test): void {
  let t = [42, 45, 99]
  const scheduler = s.mkScheduler(
    () => t.shift(),
    f => (Promise.resolve().then(f), void 0)
  )
  const line: Array<[number, number]> = []

  scheduler((o, t) => {
    line.push([0, t])
    o((o, t) => {
      line.push([1, t])
      o(3, (o, t) => {
        line.push([2, t])
      })
    })
    o(3, (o, t) => {
      line.push([3, t])
      o(3, (o, t) => {
        line.push([4, t])
        assert.deepStrictEqual(line, [
          [0, 42],
          [1, 42],
          [2, 45],
          [3, 45],
          [4, 48]
        ])
      })
    })
  })
}
