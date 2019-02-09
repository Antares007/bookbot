//@flow strict
import type { A } from '../src/atest'
import { Scheduler } from '../src/scheduler'

export function can_execute_in_expected_order(assert: Array<A>): void {
  const scheduler = Scheduler.test(30)
  const s = scheduler.schedule.bind(scheduler)
  s(0, t => {
    assert[1].strictEqual(t, 30)
    s(0, t => {
      assert[2].strictEqual(t, 30)
      s(60, t => {
        assert[5].strictEqual(t, 90)
      })
    })
    s(30, t => {
      assert[4].strictEqual(t, 60)
      s(30, t => {
        assert[7].strictEqual(t, 90)
      })
    })
    s(0, t => {
      assert[3].strictEqual(t, 30)
      s(60, t => {
        assert[6].strictEqual(t, 90)
      })
    })
  })
  assert[0].ok(true)
}
