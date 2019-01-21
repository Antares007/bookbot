//@flow
import type { A, Test } from "../src/atest.js"
import { fromPith } from "../src/timeline.js"

export function a_fromPith_returns_line(a: A & Test) {
  a.deepStrictEqual(
    fromPith(
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
    {
      tag: "Line",
      line: [[-1, "T"], [0, "i:)I"], [1, "m"], [2, "e:)!"], [3, "!:)!"]]
    }
  )
}

export function a_fromPith_when_pith_is_empty(a: A & Test) {
  a.deepStrictEqual(fromPith((a, b) => a + ":)" + b, o => {}), null)
}
