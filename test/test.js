//@flow
import type { Assert } from "../src/test.js"
import { run } from "../src/test.js"

for (let r of run(__dirname, {
  ...require("fs"),
  ...require("assert"),
  ...require("path"),
  require: (require: any)
})) {
  r.then(v => {
    if (v.errors.length > 0) {
      console.group(v.name, "fail")
      v.errors.forEach(e => console.error(e.message))
      console.groupEnd()
    } else {
      console.log(v.name, "pass")
    }
  })
}

export function a11_plan1_assert0(a: Assert) {}
export function a1_simple_test(a: Assert) {
  a.ok(false)
}

export function a1_simple_async_test2(a: Assert) {
  setTimeout(() => a.ok(true), 50)
}
