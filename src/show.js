//@flow
import { mkScheduler } from "./scheduler.js"
import * as tl from "./timeline.js"
import * as io from "./io.js"
import * as s from "./stream.js"

const initDate = Date.now()

export const scheduler = mkScheduler(
  () => Date.now() - initDate,
  f => setTimeout(f, 16.17)
)

const str = s.take(3, s.periodic(100))

s.run(v => console.log("S", v), scheduler, s.join(s.fromArray([str, str, str])))
