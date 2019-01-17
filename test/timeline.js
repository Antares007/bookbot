//@flow
import { Ring, Test } from "../src/test.js"

export default Ring("timeline", o => () => {
  o(
    Test("t1", done => {
      done()
    })
  )
  o(
    Test("t1", done => {
      done()
    })
  )
})
