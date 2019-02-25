// @flow strict-local
import type { On } from './on'
import { mkOn } from './on'
import { run, elm, text } from './pnode'
import { defaultScheduler } from './scheduler'
import { S } from './stream'

type Pith<A> = ((S<O<A>> | O<A>) => void, On) => void

type O<A> =
  | { type: 'attribute', v: { [string]: string } }
  | { type: 'style', v: { [$Keys<CSSStyleDeclaration>]: string } }
  | { type: 'dispatch', v: S<A> }
  | { type: 'element', pith: Pith<A> }
  | { type: 'text', text: string }

export const attribute = <A>(v: { [string]: string }): O<A> => ({
  type: 'attribute',
  v
})
export const style = <A>(v: {
  [$Keys<CSSStyleDeclaration>]: string
}): O<A> => ({
  type: 'style',
  v
})
export const dispatch = <A>(v: S<A>): O<A> => ({ type: 'dispatch', v })
export { elm, text }

const counter = d =>
  elm('div', (o, n) => {
    o(
      elm('button', o => {
        o(text('+'))
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      elm('button', o => {
        o(text('-'))
        d > 0 && o(counter(d - 1))
      })
    )
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

run(
  S.periodic(3000)
    .scan(a => a + 1, 0)
    .map(n => {
      if (n % 2 === 0) {
        return text('')
      }
      return counter(n % 5)
    })
)
  .map(p => p(rootNode))
  .run(console.log.bind(console), defaultScheduler)
