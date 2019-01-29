//@flow
import type { S } from "./stream.js"
import { mkScheduler } from "./scheduler.js"
import { fromArray, flatMap } from "./stream.js"
import * as rxjs from "@reactivex/rxjs"

const scheduler = mkScheduler(
  () => Date.now(),
  (f, delay) => (delay === 0 ? Promise.resolve().then(f) : setTimeout(f, delay))
)
const a = build(1000, 1000)
const b = build(1000, 1000)
const sum = (a, b) => a + b
const rec = n =>
  Promise.resolve()
    .then(() => {
      console.log()
      const start = process.hrtime.bigint()
      return reduce(sum, 0, flatMap(fromArray, fromArray(a))).then(rez =>
        console.log("a", process.hrtime.bigint() - start)
      )
    })
    // .then(() => {
    //   const start = process.hrtime.bigint()
    //   return new Promise((resolve, reject) =>
    //     rxjs.Observable.from(b)
    //       .flatMap(a => rxjs.Observable.from(a))
    //       .reduce(sum, 0)
    //       .subscribe({
    //         next: resolve,
    //         complete: () => {},
    //         error: reject
    //       })
    //   ).then(rez => console.log("b", process.hrtime.bigint() - start))
    // })
    .then(() => (n > 0 ? rec(n - 1) : void 0))
rec(10)

function build(m, n) {
  const a = new Array(n)
  for (let i = 0; i < a.length; ++i) {
    a[i] = buildArray(i * 1000, m)
  }
  return a
}

function buildArray(base, n) {
  const a = new Array(n)
  for (let i = 0; i < a.length; ++i) {
    a[i] = base + i
  }
  return a
}

function reduce<A, B>(f: (B, A) => B, initial: B, s: S<A>): Promise<B> {
  return new Promise((resolve, reject) => {
    let result = initial
    return s(
      {
        event(t, a) {
          result = f(result, a)
        },
        end(t) {
          resolve(result)
        },
        error(t, err) {
          reject(err)
        }
      },
      scheduler
    )
  })
}
