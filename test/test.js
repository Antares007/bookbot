//@flow
import type { A, Test } from "../src/atest.js"
import { awaitPromises } from "../src/iterable.js"
import { run } from "../src/atest.js"

const fail = "\u001b[31mfail\u001b[39m"
const pass = "\u001b[32mpass\u001b[39m"

const rez = [0, 0]

awaitPromises(
  v => {
    if (v == null) {
      console.log(pass, rez[0])
      console.log(fail, rez[1])
    } else if (v instanceof Error) {
      throw v
    } else {
      if (v.errors.length > 0) {
        rez[1]++
        console.log()
        console.group(`${v.name}(${v.time})`, fail)
        v.errors.forEach(e => {
          console.log(e)
        })
        console.groupEnd()
        console.log()
      } else {
        rez[0]++
        console.log(`${v.name}(${v.time})`, pass)
      }
    }
  },
  run(__dirname, {
    ...require("fs"),
    ...require("assert"),
    ...require("path"),
    require: (require: any)
  })
)

export function a_sheamocme(a: A) {
  a.deepStrictEqual({ a: 43 }, { a: 43 })
}

export function a_simple_async_test2(a: A & Test) {
  setTimeout(
    a(() => {
      a.ok(true)
    }),
    10
  )
  a.ok(true)
}
