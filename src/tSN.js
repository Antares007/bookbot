// @flow strict
import * as S from './tS'
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
  return S.flatMap(pith => {
    const rays: Array<$Call<<R>(((R) => void) => void) => R, Pith>> = []

    pith(r => {
      rays.push(r)
    })

    return S.combine(
      (...rays) =>
        N.elementBark(o => {
          for (var r of rays) o(r)
        }),
      ...rays
    )
  }, S.d(pith))
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

//S.run(console.log.bind(console), S.map(patch => patch(rootNode), s))
const counter = (depth: number) =>
  N.elm('div', o => {
    o(
      N.elm('button', o => {
        o(N.str('+'))
        depth > 0 && o(counter(depth - 1))
      })
    )
    o(
      N.elm('button', o => {
        o(N.str('-'))
        depth > 0 && o(counter(depth - 1))
      })
    )
    o(N.str('0'))
  })
N.elementBark(o => o(counter(3)))(rootNode)
