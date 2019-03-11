// @flow strict
import * as S from './stream'
import * as P from './pnode'
import * as D from './dom'
import { now, delay } from './scheduler'

//const pmap = <A, B>(key: string, b: B, pith: D.Pith<B>): D.Pith<A> =>
//  new D.Pith((o, on, s) => pith.pith(o, on, s))
//
//const p = pmap<{ o: { a: number } }, { a: number }>(
//  'hey',
//  { a: 43 },
//  new D.Pith((o, on, s) => {})
//)

const elm = <A>(
  tag: $PropertyType<D.Elm<A>, 'tag'>,
  pith: $PropertyType<D.Pith<A>, 'pith'>
): D.Elm<A> => new D.Elm(tag, null, S.at(new D.Pith(pith)))

const Counter = (d: number) =>
  elm('div', (o, on) => {
    o(
      elm('button', (o, on, s) => {
        o(new D.Str(S.at('+')))
        d > 0 && o(Counter(d - 1))
      })
    )
    o(
      elm('button', (o, on, s) => {
        o(new D.Str(S.at('-')))
        d > 0 && o(Counter(d - 1))
      })
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

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

D.run(S.at(new D.Pith(o => o(Counter(1)))))
  .scan(
    (s, x) => {
      if (x instanceof P.Patch) {
        x.v(rootNode)
        return s
      }
      return x.r(s)
    },
    { a: 43, o: { b: 1 } }
  )
  .skipEquals()
  .run(e => {
    if (e instanceof Error) console.error(e)
    else console.log(e)
  })
