// @flow
import * as SN from './SN'
import type { SN as SNT, SNPith } from './SN'
import * as S from '../S'
import { ssmap } from './streamstaff'

function pmap<A: any, B: any>(key: string, b: B, pith: SNPith<B>): SNPith<A> {
  return (o, i) => {
    pith(
      Object.assign(ss => o(ssmap(extend(key, b), ss)), o, {
        reduce: ss => {
          console.log('map reduce', key, b)
          o.reduce(
            ssmap(v => a => ({ ...a, [key]: v(typeof a[key] !== 'undefined' ? a[key] : b) }), ss)
          )
        }
      }),
      {
        ...i,
        states: i.states.map(a => (typeof a[key] !== 'undefined' ? a[key] : b))
      }
    )
  }
}
export function extend<A: any, B: any>(key: string, b: B): (SNT<B>) => SNT<A> {
  return nb =>
    nb.type === 'sElement'
      ? SN.elm(nb.tag, pmap(key, b, nb.pith), nb.key)
      : nb.type === 'sElementNS'
      ? SN.elmNS(nb.ns, nb.tag, pmap(key, b, nb.pith))
      : nb
}
