//@flow
import type { IO } from "../src/io.js"

type T =
  | { tag: "Test", name: string, f: ((?Error) => void) => void }
  | { tag: "Ring", name: string, io: IO<void, T, void> }

export function Test(name: string, f: ((?Error) => void) => void): T {
  return { tag: "Test", name, f }
}
export function Ring(name: string, io: IO<void, T, void>): T {
  return { tag: "Ring", name, io }
}

export function run(v: T): [number, number] {
  if (v.tag === "Test") {
    const arr = []
    v.f(err => {
      arr.push(err)
    })
    if (arr.length != 1)
      throw new Error(`done was called ${arr.length} times by Test(${v.name})`)
    if (arr[0]) {
      console.error(v.name, arr[0])
      return [0, 1]
    } else {
      console.log(v.name, "ok")
      return [1, 0]
    }
  } else {
    const a: [number, number] = [0, 0]
    const r = (n: number, io: IO<void, T, void>) => {
      var i = 0
      io(v => {
        if (i === n) {
          var b = run(v)
          a[0] = a[0] + b[0]
          a[1] = a[1] + b[1]
        }
        i++
      })()
      if (i > n) r(n + 1, io)
    }
    console.group(v.name + "/")
    r(0, v.io)
    console.groupEnd()
    return a
  }
}
