//@flow strict
import { mkScheduler } from "../src/scheduler.js"

export function makeTestScheduler(startTime: number) {
  let t = startTime
  return mkScheduler(
    () => t,
    (f, delay) => {
      t += delay
      Promise.resolve().then(f)
    }
  )
}
