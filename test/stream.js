// @flow strict
import type { A } from '../src/atest.js'
import * as s from '../src/stream.js'
import * as h from './helpers/teststream.js'

const id = a => a

export async function of1(assert: Array<A>) {
  var d = 0
  const act = s.Of((o, schedule) => {
    schedule(1, t => {
      assert[0].strictEqual(t, 1)
      o(s.event(t, 'a'))
      o(s.end(t))
      o(s.event(t, 'b'))
      o(s.error(t, new Error('never')))
    })
    return {
      dispose() {
        d++
      }
    }
  })
  const exp = '-(a|)'
  assert[1].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
  assert[2].strictEqual(d, 0)
}

export async function of2(assert: Array<A>) {
  var d = 0
  const act = s.Of((o, schedule) => {
    schedule(1, t => {
      assert[0].strictEqual(t, 1)
      o(s.error(t, new Error('X')))
      o(s.error(t, new Error('Y')))
      o(s.end(t))
      o(s.event(t, 'b'))
    })
    return {
      dispose() {
        d++
      }
    }
  })
  const exp = '-X'
  assert[1].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
  assert[2].strictEqual(d, 1)
}

export async function at(assert: Array<A>) {
  const act = s.at('a', 3)
  const exp = '---(a|)'
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function empty(assert: Array<A>) {
  const act = s.empty()
  const exp = ''
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function throwError(assert: Array<A>) {
  const act = s.throwError(new Error('X'))
  const exp = 'X'
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function fromArray(assert: Array<A>) {
  const act = s.fromArray(['a', 'b', 'c'])
  const exp = '(abc|)'
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function map(assert: Array<A>) {
  const s01 = 'a-b-c-|'
  const exp = 'A-B-C-|'
  const act = s.map(chr => chr.toUpperCase(), h.sOf(s01))
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function join(assert: Array<A>) {
  const s01 = '-a-b-|'
  const s02 = 'c-d-e-----(f )---|'
  const s03 = '----------(g )|'
  const exp = 'cadbe-----(fg)---|'

  const act = s.join(s.fromArray([s01, s02, s03].map(h.sOf)))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function join2(assert: Array<A>) {
  const s01 = '(abc|)'
  const s02 = 'X'
  const exp = '(abcX)'

  const act = s.join(s.fromArray([s01, s02].map(h.sOf)))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function join_ends_when_last_one_ends(assert: Array<A>) {
  const s01 = '--|'
  const s02 = '|'
  const exp = '--|'

  const act = s.join(s.fromArray([s01, s02].map(h.sOf)))
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function join_dont_ends_with_no_end(assert: Array<A>) {
  const s01 = 'a|'
  const s02 = ''
  const exp = 'a'

  const act = s.join(s.fromArray([s01, s02].map(h.sOf)))
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function join_throws_when_first_one_throws(assert: Array<A>) {
  const s01 = '-a|'
  const s02 = 'X'
  const exp = 'X'

  const act = s.join(s.fromArray([s01, s02].map(h.sOf)))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function sum(assert: Array<A>) {
  const s01 = '-a--(c )|'
  const s02 = 'b---(d )-----|'
  const exp = 'ba--(cd)-----|'

  const act = s.sum(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function sum2(assert: Array<A>) {
  const s01 = 'a---|'
  const s02 = 'X'
  const exp = '(aX)'

  const act = s.sum(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function sum3(assert: Array<A>) {
  const s01 = 'a---|'
  const s02 = ''
  const exp = 'a'

  const act = s.sum(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product1(assert: Array<A>) {
  const s01 = '2----1----|'
  const s02 = '-0-1--2|'
  const exp = '-0-2-12---|'

  const act = s.map(
    ([a, b]) => '' + parseInt(a, 10) * parseInt(b, 10),
    s.product(...[s01, s02].map(h.sOf))
  )

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product2(assert: Array<A>) {
  const s01 = '(10|)'
  const s02 = '(23|)'
  const exp = '(00|)'

  const act = s.map(
    ([a, b]) => '' + parseInt(a, 10) * parseInt(b, 10),
    s.product(...[s01, s02].map(h.sOf))
  )

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product3(assert: Array<A>) {
  const s01 = '|'
  const s02 = '---|'
  const exp = '---|'

  const act = s.product(...[s01, s02].map(h.sOf))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product4(assert: Array<A>) {
  const s01 = '1|'
  const s02 = '-X'
  const exp = '-X'

  const act = s.map(
    ([a, b]) => '' + parseInt(a, 10) * parseInt(b, 10),
    s.product(...[s01, s02].map(h.sOf))
  )

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function periodic(assert: Array<A>) {
  const act = s.take(5, s.map(n => '' + n, s.periodic(2)))
  const exp = '0-2-4-6-(8|)'

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function scan(assert: Array<A>) {
  const s01 = '( 1)23|'
  const exp = '(01)36|'

  const act = s.map(
    n => '' + n,
    s.scan((a, n) => a + parseInt(n, 10), 0, h.sOf(s01))
  )

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
