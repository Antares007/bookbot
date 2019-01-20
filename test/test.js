//@flow
import type { Assert } from "../src/test.js"
import { run } from "../src/test.js"

for (let r of run(__dirname, {
  ...require("fs"),
  ...require("assert"),
  ...require("path"),
  require: (require: any)
})) {
  r.then(v => console.log(v))
}

export function a1_simple_test(a: Assert) {
  a.ok(false)
}

export function a1_simple_async_test2(a: Assert) {
  setTimeout(() => a.ok(true), 50)
}
