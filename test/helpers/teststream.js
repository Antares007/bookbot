//@flow strict
import type { Sink, S } from "../../src/stream.js"
import { makeTestScheduler } from "./testscheduler.js"

export function toTl(s: S<string>): Promise<Array<[number, string]>> {
  return new Promise((resolve, reject) => {
    const scheduler = makeTestScheduler(99)
    const vs = []
    const d = s(
      {
        event(t, v) {
          vs.push([t, v])
        },
        end(t) {
          vs.push([t, "|"])
          resolve(vs)
        },
        error(t, err) {
          vs.push([t, err.message])
          resolve(vs)
        }
      },
      scheduler
    )
    scheduler(99, t => {
      d.dispose()
      resolve(vs)
    })
  })
}

export function sOf(str: string): S<string> {
  const line = tlOf(str)
  let canceled = false
  return (sink, sch) => {
    sch(0, t0 => {
      for (let p of line) {
        if (canceled) return
        sch(p[0], t =>
          p[1] === "|"
            ? sink.end(t - t0)
            : p[1] === "X"
            ? sink.error(t - t0, new Error("X"))
            : sink.event(t - t0, p[1])
        )
      }
    })
    return {
      dispose: () => {
        canceled = true
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
    if (chr === "X" || chr === "|") {
      line.push([t, chr])
      t += ival
      return line
    }
    if (chr === "-") {
      t += ival
      continue
    }
    if (chr === " ") continue
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
