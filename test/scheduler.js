//@flow strict
import type { A } from '../src/atest'
import { Scheduler } from '../src/scheduler'

export function can_execute_in_expected_order(assert: Array<A>): void {
  var t = 30
  const schdlr = new Scheduler(
    () => t,
    (d, f) => {
      Promise.resolve(d).then(d => ((t += d), f()))
    }
  )
  const delay = schdlr.delay.bind(schdlr)
  delay(0, t => {
    assert[1].strictEqual(t, 30)
    delay(0, t => {
      assert[2].strictEqual(t, 30)
      delay(60, t => {
        assert[5].strictEqual(t, 90)
      })
    })
    delay(30, t => {
      assert[4].strictEqual(t, 60)
      delay(30, t => {
        assert[7].strictEqual(t, 90)
      })
    })
    delay(0, t => {
      assert[3].strictEqual(t, 30)
      delay(60, t => {
        assert[6].strictEqual(t, 90)
      })
    })
  })
  assert[0].ok(true)
}
