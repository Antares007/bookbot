//@flow
import * as s from "./scheduler.js"
import * as tl from "./timeline.js"
import * as io from "./io.js"
import * as stream from "./stream.js"
const initDate = Date.now()
export const run = s.mkScheduler(
  () => Date.now() - initDate + 100,
  f => {
    setTimeout(f, 1000 / 2)
  }
)
export const see = s.Local(o => i => {
  const d = (label, delay, io) =>
    s.Delay(delay)(o => i => {
      console.log(label, i)
      io(o)(i)
    })
  o(d("A", 1, o => i => {}))
  o(d("B", 0, o => i => {}))
})
export const see2 = s.Local(o => i => {
  const d = (label, delay, io) =>
    s.Delay(delay)(o => i => {
      console.log(label, i)
      io(o)(i)
    })
  o(d("A", 1000, o => i => {}))
  o(d("B", 0, o => i => {}))
})
run(see)
stream.run(run, v => console.log("S", v), stream.at(2000, "43"))
