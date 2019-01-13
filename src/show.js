//@flow
import * as s from "./scheduler.js"
import * as tl from "./timeline.js"
import * as io from "./io.js"
import * as stream from "./stream.js"

const initDate = Date.now()

export const run = s.mkScheduler(
  () => Date.now() - initDate,
  f => setTimeout(f, 1000 / 30)
)

const str = stream.filter(v => v % 2 === 0, stream.periodic(100))

stream.run(v => console.log("S", v), run, stream.mergeArray([str, str, str]))
