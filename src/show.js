//@flow
import * as s from "./scheduler.js"
import * as tl from "./timeline.js"
import * as io from "./io.js"
import * as stream from "./stream.js"
import * as sch from "./scheduler.js"

const initDate = Date.now()

export const run = s.mkScheduler(
  () => Date.now() - initDate,
  f => setTimeout(f, 1000)
)

// run(
//   sch.Delay(0)(o => t => {
//     console.log(t)
//     run(
//       sch.Delay(0)(o => t => {
//         console.log(t)
//       })
//     )
//   })
// )
const str = stream.take(3, stream.periodic(100))

stream.run(
  v => console.log("S", v),
  run,
  stream.join(
    stream.fromArray([
      stream.at(1000, 1),
      stream.at(2000, 2),
      stream.at(3000, 3)
    ])
  )
)
