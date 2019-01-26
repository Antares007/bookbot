//@flow
import type { S } from "./stream.js"
import { mkScheduler } from "./scheduler.js"
import { fromArray, chain } from "./stream.js"
import * as rxjs from "@reactivex/rxjs"

const scheduler = mkScheduler(
  () => Date.now(),
  (f, delay) => setTimeout(f, delay)
)
const a = build(1000, 1000)

Promise.resolve()
  .then(() => {
    console.time("a")
    return reduce((a, b) => a + b, 0, chain(fromArray, fromArray(a))).then(
      rez => {
        console.timeEnd("a")
        console.log(rez)
      }
    )
  })
  .then(() => {
    console.time("b")
    rxjs.Observable.from(a)
      .flatMap(function(x) {
        return rxjs.Observable.from(x)
      })
      .reduce((a, b) => a + b, 0)
      .subscribe({
        next: rez => {
          console.log(rez)
        },
        complete: function() {
          console.timeEnd("b")
        },
        error: e => {}
      })
  })

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
        event(v, t) {
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
