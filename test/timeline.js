//@flow
import type { A, Test } from "../src/atest.js"

const tl: any = require("../src/timeline.js")
const add = (a: string, b: string) => a + b

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

export function a_run_returns_line(a: A & Test) {
  a.deepStrictEqual(tl.fromPith((a, b) => a, o => tl.run(o, [[-1, "a"]])), [
    [-1, "a"]
  ])
}

export function a_mappend_lr(a: A & Test) {
  const l = [[0, "l"]]
  const r = [[1, "r"]]
  const e = { l, r }
  a.deepStrictEqual(tl.mappend((a, b) => a, l, r), e)
}

export function a_mappend_rl(a: A & Test) {
  const l = [[1, "r"]]
  const r = [[0, "l"]]
  const e = { l: r, r: l }
  a.deepStrictEqual(tl.mappend((a, b) => a, l, r), e)
}

export function a_mappend_abc(assert: A & Test) {
  const l = { l: [[0, "a"]], r: [[1, "b"]] }
  const r = [[2, "c"]]
  const e = { l, r }
  assert.deepStrictEqual(tl.mappend((a, b) => a, l, r), e)
}

export function a_mappend_abc2(assert: A & Test) {
  const l = { l: [[0, "a"]], r: [[1, "b"]] }
  const r = [[1, "c"], [2, "d"]]
  const e = { l: l.l, r: [[1, "bc"], [2, "d"]] }
  assert.deepStrictEqual(tl.mappend((a, b) => a + b, l, r), e)
}

export function a_mappend_abc3(assert: A & Test) {
  const l = { l: [[0, "a"]], r: [[1, "b"]] }
  const r = { l: [[1, "c"]], r: [[2, "d"]] }
  const e = { l: { l: l.l, r: [[1, "bc"]] }, r: r.r }
  assert.deepStrictEqual(tl.mappend((a, b) => a + b, l, r), e)
}
