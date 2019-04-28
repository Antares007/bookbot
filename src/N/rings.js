import * as N from './N'
import * as S from '../S'
import { ssmap } from './streamstaff'

export function extend(key, b) {
  return nb =>
    nb.type === 'element'
      ? N.elm(nb.tag, (o, i) => {
          nb.pith(
            Object.assign(ss => o(ssmap(extend(key, b), ss)), {
              patch: o.patch,
              reduce: ss => o.reduce(ssmap(v => a => ({ ...a, [key]: v(a[key] || b) }), ss))
            }),
            {
              ref: i.ref,
              states: i.states.map(s => {
                if (typeof s[key] === 'object') return s[key]
                return b
              })
            }
          )
        })
      : nb
}
