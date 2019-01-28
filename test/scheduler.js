//@flow strict
import type { A } from "../src/atest.js"
import { mkScheduler } from "../src/scheduler.js"

export function can_execute_in_expected_order(assert: Array<A>): void {
  let t = 30
  const s = mkScheduler(
    () => t,
    (f, delay) => {
      t += delay
      Promise.resolve().then(f)
    }
  )
  s(0, t => {
    assert[1].ok(t === 30)
    s(0, t => {
      assert[3].ok(t === 30)
      s(60, t => {
        assert[6].ok(t === 90)
      })
    })
    s(30, t => {
      assert[4].ok(t === 60)
      s(30, t => {
        assert[7].ok(t === 90)
      })
    })
    s(t => {
      assert[2].ok(t === 30)
      s(60, t => {
        assert[5].ok(t === 90)
      })
    })
  })
  assert[0].ok(true)
}
