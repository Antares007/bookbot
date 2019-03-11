// flow strict
import * as S from './stream'
import * as D from './dom'
import * as P from './pnode'
import { On } from './on'

// export function omap<A, B>(
//   f: A => B,
//   g: (A, B) => A,
//   oa: (O<A>) => void
// ): (O<B>) => void {
//   return (b: O<B>) => {
//     if (b instanceof S.S)
//       oa(b.map(x => (x instanceof DR ? r(s => g(s, x.r(f(s)))) : x)))
//     else if (b instanceof D.DElm)
//       oa(
//         elm(b.tag, b.piths.map(p => (o, s) => p.pith(omap(f, g, o), s)), b.key)
//       )
//     else oa(b)
//   }
// }

export class R<A> {
  r: A => A
  constructor(r: $PropertyType<R<A>, 'r'>) {
    this.r = r
  }
}
export class Elm {}

export class SDPith<A> {
  pith: ((D.Elm<A> | D.Str | S.S<R<A>>) => void, On) => void
  constructor(pith: $PropertyType<SDPith<A>, 'pith'>) {
    this.pith = pith
  }
}
