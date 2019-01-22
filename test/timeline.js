//@flow
import type { A, Test } from "../src/atest.js"

const tl: any = require("../src/timeline.js")

export function a_fromPith_returns_line(a: A & Test) {
  a.deepStrictEqual(
    tl.fromPith(
      (a, b) => a + ":)" + b,
      o => {
        o([2, "e"])
        o([0, "i"])
        o([1, "m"])
        o([-1, "T"])
        o([0, "I"])
        o([3, "!"])
        o([3, "!"])
        o([2, "!"])
      }
    ),
    [[-1, "T"], [0, "i:)I"], [1, "m"], [2, "e:)!"], [3, "!:)!"]]
  )
}

export function a_fromPith_when_pith_is_empty(a: A & Test) {
  a.deepStrictEqual(tl.fromPith((a, b) => a + ":)" + b, o => {}), null)
}

export function a_toPith_returns_line(a: A & Test) {
  a.deepStrictEqual(tl.fromPith((a, b) => a, tl.toPith([[-1, "a"]])), [
    [-1, "a"]
  ])
}

export function a_mappend_lr(a: A & Test) {
  const l = [[0, "l"]]
  const r = [[1, "r"]]
  const e = { l, r, b: [0, 0, 1, 1] }
  a.deepStrictEqual(tl.mappend((a, b) => a, l, r), e)
}

export function a_mappend_rl(a: A & Test) {
  const l = [[1, "r"]]
  const r = [[0, "l"]]
  const e = { l: r, r: l, b: [0, 0, 1, 1] }
  a.deepStrictEqual(tl.mappend((a, b) => a, l, r), e)
}

export function a_mappend_abc(assert: A & Test) {
  const a = [[0, "a"]]
  const b = [[1, "b"]]
  const c = [[2, "c"]]
  const l = { l: a, r: b, b: [0, 0, 1, 1] }
  const r = c
  const e = { l, r: c, b: [0, 1, 2, 2] }
  assert.deepStrictEqual(tl.mappend((a, b) => a, l, r), e)
}

export function a_mappend_abc2(assert: A & Test) {
  const a = [[0, "a"]]
  const b = [[1, "b"]]
  const c = [[1, "c"]]
  const l = { l: a, r: b, b: [0, 0, 1, 1] }
  const r = c
  const e = { l: a, r: [[1, "bc"]], b: [0, 0, 1, 1] }
  assert.deepStrictEqual(tl.mappend((a, b) => a + b, l, r), e)
}
