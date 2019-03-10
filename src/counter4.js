// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

const Counter = (d: number) =>
  new D.Elm(
    'div',
    null,
    S.at(
      new D.Pith((o, on) => {
        o(
          new D.Elm(
            'button',
            null,
            S.at(
              new D.Pith((o, on) => {
                o(new D.Str(S.at('+')))
                d > 0 && o(Counter(d - 1))
              })
            )
          )
        )
        o(
          new D.Elm(
            'button',
            null,
            S.at(
              new D.Pith((o, on) => {
                o(new D.Str(S.at('-')))
                d > 0 && o(Counter(d - 1))
              })
            )
          )
        )
        const rez = on
          .click()
          .map(e => e.target)
          .filter2(x => (x instanceof HTMLButtonElement ? x : null))
          .map(x => x.textContent[0])
          .map(x => (x === '+' ? 1 : x === '-' ? -1 : 0))
          .scan((a, b) => a + b, 0)
          .map(String)

        o(new D.Str(rez))
      })
    )
  )

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(S.at(new D.Pith(o => o(Counter(1)))))
  .filter2(x => (x instanceof P.Patch ? x : null))
  .map(x => x.v(rootNode))
  .skipEquals()
  .run(e => {
    if (e instanceof Error) console.error(e)
    else console.log(e)
  })
