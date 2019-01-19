//@flow
import { Ring, Test, run } from "../src/test.js"

run(
  Ring("ring1", o => () => {
    console.log("ring1 start")
    o(
      Test("t1", 1, a => {
        console.log("ring1 test1 start")
        a.ok(true)
        console.log("ring1 test1 end")
      })
    )
    o(
      Test("hey2", 1, a => {
        console.log("ring1 test2 start")
        setTimeout(() => {
          a.ok(true)
          console.log("ring1 test2 end")
        }, 90)
      })
    )
    console.log("ring1 end")
  }),
  v => console.log(v)
).then(rez => console.log(rez))
