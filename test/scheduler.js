//@flow strict
import type { A } from '../src/atest'
import { now as tf, delay } from '../src/S/scheduler'

export function can_execute_in_expected_order(assert: Array<A>): void {
  const offset = 30 - tf()
  const now = () => tf() + offset
  delay(() => {
    assert[1].strictEqual(now(), 30)
    delay(() => {
      assert[2].strictEqual(now(), 30)
      delay(() => {
        assert[5].strictEqual(now(), 90)
      }, 60)
    })
    delay(() => {
      assert[4].strictEqual(now(), 60)
      delay(() => {
        assert[7].strictEqual(now(), 90)
      }, 30)
    }, 30)
    delay(() => {
      assert[3].strictEqual(now(), 30)
      delay(() => {
        assert[6].strictEqual(now(), 90)
      }, 60)
    })
  })
  assert[0].ok(true)
}
