// @flow strict
import * as S from './t'
import * as N from './tN'
import * as D from './S/Disposable'
type SPith<+A> = S.SPith<A>

export type Pith = (
  (
    SPith<
      | { R: 'Text', b: Text => void }
      | { R: 'Element', tag: string, b: HTMLElement => void }
      | { R: 'ElementNS', tag: string, ns: string, b: Element => void }
      | { R: 'Comment', b: Comment => void }
    >
  ) => void
) => void

function elementBark(pith: Pith): SPith<(HTMLElement) => void> {
  return S.s(o => {
    const spiths: Array<
      SPith<
        | { R: 'Text', b: Text => void }
        | { R: 'Element', tag: string, b: HTMLElement => void }
        | { R: 'ElementNS', tag: string, ns: string, b: Element => void }
        | { R: 'Comment', b: Comment => void }
      >
    > = []
    pith(r => {
      spiths.push(r)
    })
    return S.run(
      o,
      S.combine(
        (...rs) =>
          N.elementBark(o => {
            for (let r of rs) o(r)
          }),
        ...spiths.map(spith => S.map(a => a, spith))
      )
    )
  })
}
const elm = (tag, pith) => S.map(b => ({ R: 'Element', tag, b }), elementBark(pith))

const s = elementBark(o => {
  o(S.d(N.str('hello')))
  o(
    elm('h1', o => {
      o(
        S.d(
          N.elm('div', o => {
            o(N.str('world'))
          })
        )
      )
    })
  )
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

S.run(console.log.bind(console), S.map(patch => patch(rootNode), s))
