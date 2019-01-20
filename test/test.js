//@flow
import type { Assert } from "../src/test.js"
import { run, generate } from "../src/test.js"

run(
  v => {
    if (v.errors.length > 0) {
      console.group(v.name, "fail")
      v.errors.forEach(e => {
        console.error(e)
      })
      console.groupEnd()
    } else {
      console.log(v.name, "pass")
    }
  },
  generate(__dirname, {
    ...require("fs"),
    ...require("assert"),
    ...require("path"),
    require: (require: any)
  })
)

export function a1_plan1_assert1(a: Assert) {
  a.deepStrictEqual({ a: 42 }, { a: 43 })
}
export function a1_simple_test(a: Assert) {
  a.ok(true)
}

export function a1_simple_async_test2(a: Assert) {
  setTimeout(() => a.ok(true), 50)
}
