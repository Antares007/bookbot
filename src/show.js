//flow
import { mkScheduler } from "./scheduler.js"
import * as tl from "./timeline.js"
import * as io from "./io.js"
import * as s from "./stream.js"

const initDate = Date.now()

export const scheduler = mkScheduler(
  () => Date.now() - initDate,
  f => setTimeout(f, 20)
)

const str = s.take(3, s.periodic(100))

s.run(
  (v, t) => console.log("S", t, v),
  scheduler,
  s.join(s.at(300, s.join(s.fromArray([str]))))
)

// function doSomething() {
//   console.log(document.getElementById("root-node"))
// }
//
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", doSomething)
// } else {
//   doSomething()
// }
