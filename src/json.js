// flow strict
import { S } from './stream'
import * as s from './stream'

type Pith<A> = ((O<A>) => void) => void

type O<A> = { type: 'reduce', r: (?A) => A } | { type: 'merge', pith: Pith<A> }

const r = <A>(r: (?A) => A): O<A> => ({ type: 'reduce', r })
const m = <A>(pith: Pith<A>): O<A> => ({ type: 'merge', pith })

declare var run: <A>(O<A>) => S<(?A) => A>

let see = run(
  m(o => {
    o(
      r(a => ({
        a: 43
      }))
    )
    o(
      m(o => {
        o(
          r(a => ({
            b: 43
          }))
        )
      })
    )
  })
)
//

S.at(a => a)
  .map(r => a => ({ ...a, b: r(a.b) }))
  .scan((a, r) => r(a), { a: 43, b: { o: 1 } })
