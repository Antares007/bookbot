// @flow strict
import { mkScheduler } from './scheduler'
let t = 0
const schedule = mkScheduler(
  () => t,
  (f, d) => {
    t += d
    Promise.resolve().then(f)
  }
)

schedule(t => {
  const offset = 0 - t
  const rec = (tag, d: number) => t => {
    console.log(t + offset, tag)
    if (d > 0) schedule(0, rec(`${tag} => ${d}.A`, d - 1))
    if (d > 0) schedule(0, rec(`${tag} => ${d}.C`, d - 1))
  }
  schedule(rec('O', 3))
})
