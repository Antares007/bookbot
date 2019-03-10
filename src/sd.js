// flow strict
import * as S from './stream'
import * as D from './dom'
import * as P from './pnode'
import { On } from './on'

type O<A> = D.DElm<A> | D.DStr | S.S<SDR<A> | P.PPatch>

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

D.elm('div', (o, on) => {
  on.click()
})

export class SDR<A> {
  r: A => A
  constructor(r: $PropertyType<SDR<A>, 'r'>) {
    this.r = r
  }
}
export function r<A>(r: $PropertyType<SDR<A>, 'r'>): SDR<A> {
  return new SDR(r)
}

// pith: ((DElm<A> | DStr | S.S<A | P.PPatch>) => void, On) => void
export class SDPith<A> {
  pith: ((D.DElm<A> | D.DStr | S.S<SDR<A>>) => void, On) => void
  constructor(pith: $PropertyType<SDPith<A>, 'pith'>) {
    this.pith = pith
  }
}
