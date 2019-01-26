//@flow
import type { A, Test } from "../src/atest.js"
import * as s from "../src/stream.js"
import { mkRun } from "../src/scheduler.js"

export function at(assert: A & Test) {
  let now = 100
  const scheduler = mkRun(
    () => now,
    (f, at) => {
      now = at
      Promise.resolve().then(f)
    }
  )
  const vs = []
  s.at("a", 99)(
    {
      event(v, t) {
        vs.push([v, t])
      },
      end() {
        assert.deepStrictEqual(vs, [["a", 99]])
      },
      error() {
        vs.push("error")
      }
    },
    scheduler
  )
  assert.ok(vs.length === 0)
}
