//@flow
import { makeRun } from "../src/test.js"

const run = makeRun(require("assert"))

run(1, a => {
  console.log("ring1 test1 start")
  a.ok(true)
  console.log("ring1 test1 end")
}).then(v => console.log(v))

run(1, a => {
  console.log("ring1 test2 start")
  setTimeout(() => {
    a.ok(true)
    console.log("ring1 test2 end")
  }, 90)
}).then(v => console.log(v))
