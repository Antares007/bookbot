//@flow
import { Ring, Test, run } from "../src/test.js"

run(
  Ring("ring1", o => () => {
    console.log(1)
    o(
      Test("hey", 1, a => {
        console.log(2)
        a.ok(true)
      })
    )
    o(
      Test("hey2", 1, a => {
        console.log(3)
        setTimeout(() => {
          console.log(4)
          a.ok(true)
        }, 90)
      })
    )
    console.log(5)
  }),
  v => console.log(v)
).then(rez => console.log(rez))
