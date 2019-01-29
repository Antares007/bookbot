//@flow
import type { S } from "./stream.js"
import { mkScheduler } from "./scheduler.js"
import { fromArray, flatMap } from "./stream.js"
import * as rxjs from "@reactivex/rxjs"

const scheduler = mkScheduler(
  () => Date.now(),
  (f, delay) => setTimeout(f, delay)
)
const a = build(1000, 1000)
const b = build(1000, 1000)

const rec = n =>
  Promise.resolve()
    .then(() => {
      console.time("a")
      return reduce((a, b) => a + b, 0, flatMap(fromArray, fromArray(a))).then(
        rez => {
          console.timeEnd("a")
          console.log(rez)
        }
      )
    })
    .then(() => {
      console.time("b")
      return new Promise((resolve, reject) =>
        rxjs.Observable.from(b)
          .flatMap(function(x) {
            return rxjs.Observable.from(x)
          })
          .reduce((a, b) => a + b, 0)
          .subscribe({
            next: resolve,
            complete: () => {},
            error: reject
          })
      ).then(rez => {
        console.timeEnd("b")
        console.log(rez)
      })
    })
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
    s(
      {
        event(t, v) {
          result = f(result, v)
        },
        end(v) {
          resolve(result)
        },
        error(v) {
          reject(v)
        }
      },
      scheduler
    )
  })
}
