//@flow strict
import type { A } from "../src/atest.js"
import type { Sink } from "../src/stream.js"
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

export function fromArray(assert: Array<A>) {
  const scheduler = makeTestScheduler(30)
  s.fromArray(["a", "b", "c"])(
    collectEvents(es =>
      scheduler(t => {
        assert[0].ok(t === 30)
        assert[1].deepStrictEqual(es, [[0, "a"], [0, "b"], [0, "c"], [0, "|"]])
      })
    ),
    scheduler
  )
}

export function join(assert: Array<A>) {
  const scheduler = makeTestScheduler(30)
  s.join(
    s.fromArray([s.at("a", 10), s.at("b", 20), s.at("c", 30), s.at("d", 10)])
  )(
    collectEvents(es =>
      scheduler(t => {
        assert[0].ok(t === 60)
        assert[1].deepStrictEqual(es, [
          [10, "a"],
          [10, "d"],
          [20, "b"],
          [30, "c"],
          [30, "|"]
        ])
      })
    ),
    scheduler
  )
}

function collectEvents(done: (Array<[number, string]>) => void): Sink<string> {
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
