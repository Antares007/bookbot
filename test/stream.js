//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/stream.js"
import { mkRun } from "../src/scheduler.js"

export function at(assert: A) {
  let now = 0
  const scheduler = mkRun(
    () => now,
    (f, at) => {
      now = at
      Promise.resolve().then(f)
    }
  )
  const vs = []
  s.at("a", 99)((v, t) => {
    if (v == null) {
      assert.deepStrictEqual(vs, [["a", 99]])
    } else {
      vs.push([v, t])
    }
  }, scheduler)
}
