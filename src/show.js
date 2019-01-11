//@flow
import * as s from "./scheduler.js"
import * as tl from "./timeline.js"
import * as io from "./io.js"
const add = (a: string, b: string) => a + b
const l1 = tl.fromIO(add, o => () => {
  o([1, "A"])
  o([2, "c"])
  o([3, "h"])
  o([4, "i"])
  o([5, "k"])
  o([6, "o"])
})
const l2 = tl.fromIO(
  add,
  io.omap(([n, s]) => [n * -1, s])(o => () => {
    o([2, "c"])
    o([3, "h"])
    o([4, "i"])
    o([5, "k"])
    o([6, "o"])
    o([1, "A"])
  })
)
const l3 = tl.fromIO(
  add,
  io.omap(([n, s]) => [n * 10, s])(o => () => {
    o([1, "A"])
    o([2, "c"])
    o([3, "h"])
    o([4, "i"])
    o([5, "k"])
    o([6, "o"])
  })
)
if (l1 == null || l2 == null || l3 == null) throw new Error("never")
const line = tl.mappend(add, l1, l2)
tl.show(line)
let rest = tl.runTo(add, -2, line)(x => {
  console.log(x)
})()
if (rest == null) throw new Error("never")
tl.show(rest)

const see = s.Local(o => i => {
  console.log("a", i)
  o(
    s.Delay(2000)(o => i => {
      console.log("b", i)
      o(
        s.Delay(3000)(o => i => {
          console.log("c", i)
        })
      )
    })
  )
})
const run = s.mkScheduler(
  () => Date.now(),
  f => {
    setTimeout(f, 1000 / 30)
  }
)
run(see)
