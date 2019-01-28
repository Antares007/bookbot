//@flow strict
import type { A } from "../src/atest.js"
import type { O as So } from "../src/stream.js"
import * as s from "../src/stream.js"
import { makeTestScheduler } from "./testscheduler.js"

export function at(assert: Array<A>) {
  const scheduler = makeTestScheduler(30)

  s.at("a", 60)(
    collectEvents(es =>
      scheduler(t => {
        assert[0].ok(t === 90)
        assert[1].deepStrictEqual(es, [[60, "a"], [60, "|"]])
      })
    ),
    scheduler
  )
}

function collectEvents(done: (Array<[number, string]>) => void): So<string> {
  const vs = []
  return {
    event(t, v) {
      vs.push([t, v])
    },
    end(t) {
      vs.push([t, "|"])
      done(vs)
    },
    error(t, err) {
      vs.push([t, "X"])
      done(vs)
    }
  }
}
