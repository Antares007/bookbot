// @flow strict
import * as S from '../../S'
import type { NPith } from '../N'
import { R } from '../srun.js'

export function extend<A, B>(
  key: string,
  b: B
): (NPith<{ states: S.S<B> }, R<B>>) => NPith<{ states: S.S<A> }, R<A>> {
  throw new Error()
  //return function map(pith) {
  //  return (o, i) =>
  //    pith(
  //      v => {
  //        if (v instanceof S.S)
  //          o(
  //            v.map(x =>
  //              x instanceof R
  //                ? r((a: A) => ({ ...a, [key]: x.r(a[key] || b) }))
  //                : x
  //            )
  //          )
  //        else o(v.pmap(map))
  //      },
  //      {
  //        ...i,
  //        states: i.states.map(s => {
  //          if (typeof s[key] === 'object') return s[key]
  //          return b
  //        })
  //      }
  //    )
  //}
}
