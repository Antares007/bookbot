//@flow strict
import type { A } from "../src/atest.js"
import * as s from "../src/stream.js"
import * as h from "./helpers/teststream.js"

const id = a => a

export async function at(assert: Array<A>) {
  const act = s.at("a", 3)
  const exp = "---(a|)"
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function empty(assert: Array<A>) {
  const act = s.empty
  const exp = ""
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function throwError(assert: Array<A>) {
  const act = s.throwError(new Error("X"))
  const exp = "X"
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function fromArray(assert: Array<A>) {
  const act = s.fromArray(["a", "b", "c"])
  const exp = "(abc|)"
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function map(assert: Array<A>) {
  const s01 = "a-b-c-|"
  const exp = "A-B-C-|"
  const act = s.map(chr => chr.toUpperCase(), h.sOf(s01))
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap(assert: Array<A>) {
  const s01 = "-a-b-|"
  const s02 = "c-d-e-----(f )---|"
  const s03 = "----------(g )|"
  const exp = "cadbe-----(fg)---|"

  const act = s.flatMap(id, s.fromArray([s01, s02, s03].map(h.sOf)))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap2(assert: Array<A>) {
  const s01 = "(abc|)"
  const s02 = "X"
  const exp = "(abcX)"

  const act = s.flatMap(id, s.fromArray([s01, s02].map(h.sOf)))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap_ends_when_last_one_ends(assert: Array<A>) {
  const s01 = "--|"
  const s02 = "|"
  const exp = "--|"

  const act = s.flatMap(id, s.fromArray([s01, s02].map(h.sOf)))
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap_dont_ends_with_no_end(assert: Array<A>) {
  const s01 = "a|"
  const s02 = ""
  const exp = "a"

  const act = s.flatMap(id, s.fromArray([s01, s02].map(h.sOf)))
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap_throws_when_first_one_throws(assert: Array<A>) {
  const s01 = "-a|"
  const s02 = "X"
  const exp = "X"

  const act = s.flatMap(id, s.fromArray([s01, s02].map(h.sOf)))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function merge1(assert: Array<A>) {
  const s01 = "-a--(c )|"
  const s02 = "b---(d )-----|"
  const exp = "ba--(cd)-----|"

  const act = s.merge(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function merge2(assert: Array<A>) {
  const s01 = "a---|"
  const s02 = "X"
  const exp = "(aX)"

  const act = s.merge(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function merge3(assert: Array<A>) {
  const s01 = "a---|"
  const s02 = ""
  const exp = "a"

  const act = s.merge(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function combine1(assert: Array<A>) {
  const s01 = "2----1----|"
  const s02 = "-0-1--2|"
  const exp = "-0-2-12---|"

  const act = s.map(
    ([a, b]) => "" + parseInt(a, 10) * parseInt(b, 10),
    s.combine(...[s01, s02].map(h.sOf))
  )

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function combine2(assert: Array<A>) {
  const s01 = "|"
  const s02 = "---|"
  const exp = "---|"

  const act = s.combine(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function combine3(assert: Array<A>) {
  const s01 = "1|"
  const s02 = "-X"
  const exp = "-X"

  const act = s.map(
    ([a, b]) => "" + parseInt(a, 10) * parseInt(b, 10),
    s.combine(...[s01, s02].map(h.sOf))
  )

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
