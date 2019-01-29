//@flow strict
import type { A } from "../src/atest.js"
import * as s from "../src/stream.js"
import * as h from "./helpers/teststream.js"

export async function at(assert: Array<A>) {
  const act = s.at("a", 3)
  const exp = "---(a|)"
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function empty(assert: Array<A>) {
  const act = s.empty()
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

export async function join(assert: Array<A>) {
  const s01 = "-a-b-|"
  const s02 = "c-d-e-----(f )---|"
  const s03 = "----------(g )|"
  const exp = "cadbe-----(fg)---|"

  const act = s.join(s.fromArray([s01, s02, s03].map(h.sOf)))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
