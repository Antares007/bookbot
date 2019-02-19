// @flow strict
import type { A } from '../src/atest'
import { S, event, end, error } from '../src/stream'
import * as h from './helpers/teststream'
import { Scheduler } from '../src/scheduler'

const id = a => a

export async function of1(assert: Array<A>) {
  var d = 0
  const act = S.of((o, schdlr) => {
    schdlr.delay(1, t => {
      assert[0].strictEqual(t, 1)
      o(event(t, 'a'))
      o(end(t))
      o(event(t, 'b'))
      o(error(t, new Error('never')))
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
  const act = S.of((o, schdlr) => {
    schdlr.delay(1, t => {
      assert[0].strictEqual(t, 1)
      o(error(t, new Error('X')))
      o(error(t, new Error('Y')))
      o(end(t))
      o(event(t, 'b'))
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
export async function of3(assert: Array<A>) {
  var d = 0
  const scheduler = Scheduler.asap(0)
  const act = S.of((o, schdlr) => {
    scheduler.delay(1, t => {
      assert[0].strictEqual(t, 1)
      o(error(t, new Error('X')))
    })
    return {
      dispose() {
        d++
      }
    }
  })
  const exp = '-X'
  const ds = act.run(e => {
    assert[1].ok(true)
  }, scheduler)
  scheduler.delay(2, t => {
    ds.dispose()
    assert[2].strictEqual(d, 1)
  })
}
export async function of4(assert: Array<A>) {
  var d = 0
  const scheduler = Scheduler.asap(0)
  const act = S.of((o, schdlr) => {
    schdlr.delay(1, t => {
      assert[0].strictEqual(t, 1)
      o(end(t))
    })
    return {
      dispose() {
        d++
      }
    }
  })
  const exp = '-X'
  const ds = act.run(e => {
    assert[1].ok(true)
  }, scheduler)
  scheduler.delay(2, t => {
    ds.dispose()
    assert[2].strictEqual(d, 1)
  })
}
export async function at(assert: Array<A>) {
  const act = S.at('a', 3)
  const exp = '---(a|)'
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function empty(assert: Array<A>) {
  const act = S.empty()
  const exp = '|'
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function never(assert: Array<A>) {
  const act = S.never()
  const exp = ''
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function throwError(assert: Array<A>) {
  const act = S.throwError(new Error('X'))
  const exp = 'X'
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function fromArray(assert: Array<A>) {
  const act = S.fromArray(['a', 'b', 'c'])
  const exp = '(abc|)'
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function map(assert: Array<A>) {
  const s01 = 'a-b-c-|'
  const exp = 'A-B-C-|'
  const act = h.sOf(s01).map(chr => chr.toUpperCase())
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function map2(assert: Array<A>) {
  const s01 = 'a-b-c-|'
  const exp = 'A-X'
  const act = h.sOf(s01).map(chr => {
    if (chr === 'b') throw new Error('X')
    else return chr.toUpperCase()
  })
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap(assert: Array<A>) {
  const s01 = '-a-b-|'
  const s02 = 'c-d-e-----(f )---|'
  const s03 = '----------(g )|'
  const exp = 'cadbe-----(fg)---|'

  const act = S.fromArray([s01, s02, s03]).flatMap(h.sOf)

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap2(assert: Array<A>) {
  const s01 = '(abc|)'
  const s02 = 'X'
  const exp = '(abcX)'

  const act = S.fromArray([s01, s02]).flatMap(h.sOf)

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap_ends_when_last_one_ends(assert: Array<A>) {
  const s01 = '--|'
  const s02 = '|'
  const exp = '--|'

  const act = S.fromArray([s01, s02]).flatMap(h.sOf)
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap_dont_ends_with_no_end(assert: Array<A>) {
  const s01 = 'a|'
  const s02 = ''
  const exp = 'a'

  const act = S.fromArray([s01, s02]).flatMap(h.sOf)
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function flatMap_throws_when_first_one_throws(assert: Array<A>) {
  const s01 = '-a|'
  const s02 = 'X'
  const exp = 'X'

  const act = S.fromArray([s01, s02]).flatMap(h.sOf)
  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function sum(assert: Array<A>) {
  const s01 = '-a--(c )|'
  const s02 = 'b---(d )-----|'
  const exp = 'ba--(cd)-----|'

  const act = h.sOf(s01).sum(h.sOf(s02))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function sum2(assert: Array<A>) {
  const s01 = 'a---|'
  const s02 = 'X'
  const exp = '(aX)'

  const act = h.sOf(s01).sum(h.sOf(s02))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function sum3(assert: Array<A>) {
  const s01 = 'a---|'
  const s02 = ''
  const exp = 'a'

  const act = h.sOf(s01).sum(h.sOf(s02))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product1(assert: Array<A>) {
  const s01 = '2----1----|'
  const s02 = '-0-1--2|'
  const exp = '-0-2-12---|'

  const act = h
    .sOf(s01)
    .product(h.sOf(s02))
    .map(([a, b]) => '' + parseInt(a, 10) * parseInt(b, 10))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
const combine = (...args) =>
  S.combine(
    (a, b) => parseInt(a, 10) * parseInt(b, 10) + '',
    ...args.map(h.sOf)
  ).map((...args) => '' + args.reduce((a, b) => parseInt(b, 10) * a, 1))

export async function combine1(assert: Array<A>) {
  const s01 = '2----1----|'
  const s02 = '-0-1--2|'
  const exp = '-0-2-12---|'

  const act = combine(s01, s02)

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product2(assert: Array<A>) {
  const s01 = '(10|)'
  const s02 = '(23|)'
  const exp = '(00|)'

  const act = h
    .sOf(s01)
    .product(h.sOf(s02))
    .map(([a, b]) => '' + parseInt(a, 10) * parseInt(b, 10))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
export async function combine2(assert: Array<A>) {
  const s01 = '(10|)'
  const s02 = '(23|)'
  const exp = '(00|)'

  const act = combine(s01, s02, exp)

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product3(assert: Array<A>) {
  const s01 = '|'
  const s02 = '---|'
  const exp = '---|'

  const act = h
    .sOf(s01)
    .product(h.sOf(s02))
    .map(([a, b]) => '' + parseInt(a, 10) * parseInt(b, 10))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
export async function combine3(assert: Array<A>) {
  const s01 = '|'
  const s02 = '---|'
  const exp = '---|'

  const act = combine(s01, s02, exp)

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function product4(assert: Array<A>) {
  const s01 = '1|'
  const s02 = '-X'
  const exp = '-X'

  const act = h
    .sOf(s01)
    .product(h.sOf(s02))
    .map(([a, b]) => '' + parseInt(a, 10) * parseInt(b, 10))

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
export async function combine4(assert: Array<A>) {
  const s01 = '1|'
  const s02 = '-X'
  const exp = '-X'

  const act = combine(s01, s02, exp)

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}

export async function scan(assert: Array<A>) {
  const s01 = '( 1)23|'
  const exp = '(01)36|'

  const act = h
    .sOf(s01)
    .scan((a, n) => a + parseInt(n, 10), 0)
    .map(n => '' + n)

  assert[0].deepStrictEqual(await h.toTl(act), h.tlOf(exp))
}
