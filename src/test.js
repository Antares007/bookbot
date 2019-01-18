//@flow
import type { IO } from "../src/io.js"
import assert_ from "assert"

type Assert = {|
  ok: (value: any, message?: string) => void,
  equal: (value: any, message?: string) => void,
  deepEqual: (actual: any, expected: any, message?: string) => void,
  notEqual: (actual: any, expected: any, message?: string) => void,
  notDeepEqual: (actual: any, expected: any, message?: string) => void
|}

export opaque type T =
  | { tag: "Test", name: string, plan: number, f: Assert => void }
  | { tag: "Ring", name: string, io: IO<void, T, void> }

export function Test(name: string, plan: number, f: Assert => void): T {
  return { tag: "Test", name, plan, f }
}
export function Ring(name: string, io: IO<void, T, void>): T {
  return { tag: "Ring", name, io }
}

type O =
  | {
      tag: "Result",
      name: string,
      pass: boolean,
      time: number,
      plan: number,
      asserts: Array<?Error>
    }
  | { tag: "group", name: string }
  | { tag: "groupEnd" }

export function run(v: T, o: O => void): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (v.tag === "Test") {
      const asserts: Array<?Error> = []
      const assert = (assert_: any).strict
      const mkAssertFn = name => (...args) => {
        try {
          assert[name](...args)
          asserts.push(null)
        } catch (err) {
          if (err && err.code === "ERR_ASSERTION" && err instanceof Error) {
            asserts.push(err)
          } else {
            reject(err)
          }
        }
      }
      const t0 = Date.now()
      try {
        v.f({
          ok: mkAssertFn("ok"),
          equal: mkAssertFn("equal"),
          notEqual: mkAssertFn("notEqual"),
          deepEqual: mkAssertFn("deepEqual"),
          notDeepEqual: mkAssertFn("notDeepEqual")
        })
      } catch (err) {
        return reject(err)
      }
      const t1 = Date.now()
      const name = v.name
      const plan = v.plan
      const rec = () => {
        const t2 = Date.now()
        const time = t2 - t1
        var pass: boolean
        if (
          (pass =
            asserts.length === plan && !asserts.some(v => v instanceof Error))
        ) {
          o({ tag: "Result", name, pass, time, plan, asserts })
          resolve([1, 0])
        } else if (t2 - t1 > 99) {
          o({ tag: "Result", name, pass, time, plan, asserts })
          resolve([0, 1])
        } else {
          setTimeout(rec, 0)
        }
      }
      setTimeout(rec, 0)
    } else {
      const io = v.io
      const rez: [number, number] = [0, 0]
      var p = Promise.resolve()
      var i = 0
      io(v => {
        const n = i++
        p = p.then(
          () =>
            new Promise((resolve, reject) => {
              var i = 0
              io(v => {
                if (i++ === n)
                  run(v, o).then(rez2 => {
                    rez[0] = rez[0] + rez2[0]
                    rez[1] = rez[1] + rez2[1]
                    resolve()
                  }, reject)
              })()
            })
        )
      })()
      p.then(() => resolve(rez))
    }
  })
}
