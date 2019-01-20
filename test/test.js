//@flow
import type { Assert } from "../src/test.js"
import { run, generate } from "../src/test.js"

const fail = "\u001b[31mfail\u001b[39m"
const pass = "\u001b[32mpass\u001b[39m"

const rez = [0, 0]

run(
  v => {
    if (v.errors.length > 0) {
      rez[1]++
      console.group(v.name, fail)
      v.errors.forEach(e => {
        console.log(JSON.stringify(e.message))
        console.log(e.message)
      })
      console.groupEnd()
    } else {
      rez[0]++
      console.log(v.name, pass)
    }
  },
  generate(__dirname, {
    ...require("fs"),
    ...require("assert"),
    ...require("path"),
    require: (require: any)
  })
)

export function a1_sheamocme(a: Assert) {
  a.deepStrictEqual({ a: 43 }, { a: 43 })
}
export function a1_simple_test(a: Assert) {
  a.ok(true)
}

export function a1_simple_async_test2(a: Assert) {
  setTimeout(() => a.ok(true), 50)
}
