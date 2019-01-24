//@flow
import type { A, Test } from "../src/atest.js"

const tl: any = require("../src/timeline.js")

const throws = () => {
  throw new Error("never")
}

export function fromPith_returns_line(assert: A & Test) {
  assert.deepStrictEqual(
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
export function fromPith_when_pith_is_empty_returns_null(assert: A & Test) {
  assert.ok(tl.fromPith(throws, o => {}) == null)
}

export function run(assert: A & Test) {
  assert.deepStrictEqual(
    tl.fromPith(throws, o => {
      tl.run(o, LR(L(-1), L(0, 1)))
    }),
    L(-1, 0, 1)
  )
}

export function mappend_l_end_less_then_r_start(assert: A & Test) {
  const l = L(0, 2)
  const r = L(3, 4)
  const e = LR(l, r)
  assert.deepStrictEqual(tl.mappend(throws, l, r), e)
}
export function mappend_l_start_greater_then_r_end(assert: A & Test) {
  const l = L(3, 4)
  const r = L(0, 2)
  const e = LR(r, l)
  assert.deepStrictEqual(tl.mappend(throws, l, r), e)
}
export function mappend_l_overlap_r(assert: A & Test) {
  const l = L(0, 2)
  const r = L(1, 3)
  const e = L(0, 1, 2, 3)
  assert.deepStrictEqual(tl.mappend(throws, l, r), e)
}
export function mappend_llr_end_less_then_r_start(assert: A & Test) {
  const l = LR(L(0), L(1))
  const r = L(2)
  const e = LR(l, r)
  assert.deepStrictEqual(tl.mappend(throws, l, r), e)
}
export function mappend_l_l_end_less_then_r_start(assert: A & Test) {
  const l = LR(L(0), L(1, 3))
  const r = L(2, 4)
  const e = { l: l.l, r: L(1, 2, 3, 4) }
  assert.deepStrictEqual(tl.mappend(throws, l, r), e)
}
export function mappend_l_l_end_equal_r_start(assert: A & Test) {
  const l = LR(L(-1, 0), L(1))
  const r = L(0, 2)
  const e = L(-1, 0, 1, 2)
  assert.deepStrictEqual(tl.mappend(() => "", l, r), e)
}
export function mappend_l_l_end_less_then_r_l_start(assert: A & Test) {
  const l = LR(L(0, 1), L(2, 4))
  const r = LR(L(3, 5), L(6))
  const e = LR(LR(l.l, L(2, 3, 4, 5)), r.r)
  assert.deepStrictEqual(tl.mappend(throws, l, r), e)
}
export function mappend_l_l_end_not_less_then_r_l_start(assert: A & Test) {
  const l = LR(L(0, 1), L(2, 4))
  const r = LR(L(1, 5), L(6))
  const e = L(0, 1, 2, 4, 5, 6)
  assert.deepStrictEqual(tl.mappend((a, b) => "", l, r), e)
}

function L(...args) {
  return args.map(a => [a, ""])
}
function LR(l, r) {
  return { l, r }
}
