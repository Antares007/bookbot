//@flow strict
import type { S } from "../../src/stream.js"
import * as s from "../../src/stream.js"
import { makeTestScheduler } from "./testscheduler.js"

export function toTl<A>(s: S<A>): Promise<Array<[number, string]>> {
  return new Promise((resolve, reject) => {
    const scheduler = makeTestScheduler(99)
    const vs = []
    const d = s(e => {
      vs.push([
        e.t,
        e.type === "event" ? String(e.v) : e.type === "end" ? "|" : e.v.message
      ])
    }, scheduler)
    scheduler(99, t => {
      d.dispose()
      resolve(vs.slice(0))
    })
  })
}

export function sOf(str: string): S<string> {
  const line = tlOf(str)
  let active = true
  return (sink, schedule) => {
    schedule(0, t0 => {
      for (let p of line) {
        if (!active) return
        schedule(p[0], t =>
          p[1] === "|"
            ? sink(s.end(t - t0))
            : p[1] === "X"
            ? sink(s.error(t - t0, new Error("X")))
            : sink(s.event(t - t0, p[1]))
        )
      }
    })
    return {
      dispose: () => {
        active = false
      }
    }
  }
}

export function tlOf(str: string): Array<[number, string]> {
  const line = []
  let ival = 1
  let t = 0
  for (let i = 0, l = str.length; i < l; i++) {
    let chr = str[i]
    if (chr === " ") continue
    if (chr === "-") {
      t += ival
      continue
    }
    if (chr === "(") {
      ival = 0
      continue
    }
    if (chr === ")") {
      ival = 1
      t += ival
      continue
    }
    line.push([t, chr])
    t += ival
  }
  return line
}
