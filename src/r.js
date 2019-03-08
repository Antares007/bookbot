// @flow strict
import * as S from './stream'

type SS<A> = S.S<A> | A

export class RString {
  r: (?string) => string
  constructor(r: $PropertyType<RString, 'r'>) {
    this.r = r
  }
}
export function String(r: $PropertyType<RString, 'r'>): RString {
  return new RString(r)
}

export class RNumber {
  r: (?number) => number
  constructor(r: $PropertyType<RNumber, 'r'>) {
    this.r = r
  }
}
export function Number(r: $PropertyType<RNumber, 'r'>): RNumber {
  return new RNumber(r)
}

export class RBoolean {
  r: (?boolean) => boolean
  constructor(r: $PropertyType<RBoolean, 'r'>) {
    this.r = r
  }
}
export function Boolean(r: $PropertyType<RBoolean, 'r'>): RBoolean {
  return new RBoolean(r)
}

//export class RObject<A: { [string]: mixed }> {
//  r: mixed => A
//  constructor(
//    a: A,
//    pith: (
//      (SS<RKV<string, RString | RNumber | RBoolean | RObject | RArray>>) => void
//    ) => void
//  ) {
//    this.r = n => {
//      if (n) {
//        n.b
//      }
//      return { a: 1 }
//    }
//  }
//}
//export function Object(pith: $PropertyType<RObject, 'pith'>): RObject {
//  return new RObject(pith)
//}
//
//export class RArray {
//  pith: S.S<RPith<number, mixed>>
//  constructor(pith: $PropertyType<RArray, 'pith'>) {
//    this.pith = pith
//  }
//}
//export function Array(pith: $PropertyType<RArray, 'pith'>): RArray {
//  return new RArray(pith)
//}
S.at(n => n)
  .map(r => s => ({ ...s, z: r(s.z) }))
  .map(r => s => ({ ...s, b: r(s.b) }))
  .scan((s, r) => r(s), { a: 43, b: { o: '1', z: true } })
Pith(o => {
  o(S.at(KV('a', S.at(Number(n => n || 0)))))
  o(
    S.at(
      KV(
        'o',
        S.at(
          Pith<number>(o => {
            const see = S.at(KV(1, S.at(Number(n => n || 0))))
            o(see)
          })
        )
      )
    )
  )
})

export class RKV<K: string | number, V> {
  k: K
  v: S.S<V>
  constructor(
    k: $PropertyType<RKV<K, V>, 'k'>,
    v: $PropertyType<RKV<K, V>, 'v'>
  ) {
    this.k = k
    this.v = v
  }
}
export function KV<K: string | number, V>(
  k: $PropertyType<RKV<K, V>, 'k'>,
  v: $PropertyType<RKV<K, V>, 'v'>
): RKV<K, V> {
  return new RKV(k, v)
}

export class RPith<K: string | number> {
  pith: (
    (
      SS<RKV<K, RString | RNumber | RBoolean | RPith<string> | RPith<number>>>
    ) => void
  ) => void
  constructor(pith: $PropertyType<RPith<K>, 'pith'>) {
    this.pith = pith
  }
}
export function Pith<K: string | number>(
  pith: $PropertyType<RPith<K>, 'pith'>
): RPith<K> {
  return new RPith(pith)
}
