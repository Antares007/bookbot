//@flow strict
import type { A } from "../src/atest.js"
import * as s from "../src/stream.js"
import { mkScheduler } from "../src/scheduler.js"

export function at(assert: Array<A>) {
  let now = 100
  const scheduler = mkScheduler(
    () => now,
    (f, delay) => {
      now += delay
      Promise.resolve().then(f)
    }
  )
  const vs = []
  s.at("a", 99)(
    {
      event(t, v) {
        vs.push([t, v])
      },
      end() {
        assert[0].deepStrictEqual(vs, [[99, "a"]])
      },
      error(t, err) {
        vs.push(err)
      }
    },
    scheduler
  )
}
