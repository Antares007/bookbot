//@flow
import { Ring, Test } from "../src/test.js"
import { run } from "../src/test.js"

console.log(
  run(
    Ring("timeline", o => () => {
      console.log(0)
      o(
        Test("t1", done => {
          console.log(1)
          done()
          console.log(2)
        })
      )
      o(
        Test("t1", done => {
          console.log(3)
          done()
          console.log(4)
        })
      )
      console.log(5)
    })
  )
)
