// @flow strict
import * as S from './stream2'
import type { PNode$pith } from './pnode2'
import * as N from './pnode2'
import { now } from './scheduler2'

const elm = (tag: string, xpith: S.S<PNode$pith> | PNode$pith) =>
  N.node(
    () => document.createElement(tag),
    n => n.nodeName === tag.toUpperCase(),
    xpith instanceof S.S ? xpith : S.at(xpith)
  )
const text = (stext: S.S<string>) =>
  N.node(
    () => document.createTextNode(''),
    n => n.nodeName === '#text',
    S.at(
      N.pith(o =>
        o(
          S.map(
            text =>
              N.patch(n => {
                n.textContent = text
              }),
            stext
          )
        )
      )
    )
  )

const counter = (d: number) =>
  elm(
    'div',
    N.pith(o => {
      o(
        elm(
          'button',
          N.pith(o => {
            o(text(S.at('+')))
            //     d > 0 && o(counter(d - 1))
            o(
              elm(
                'div',
                N.pith(o => {
                  o(
                    elm(
                      'button',
                      N.pith(o => {
                        o(
                          text(
                            S.periodic(1000)
                              .take(10)
                              .map(i => i + ' +')
                          )
                        )
                        //     d > 0 && o(counter(d - 1))
                      })
                    )
                  )
                  o(
                    elm(
                      'button',
                      N.pith(o => {
                        o(text(S.at('-')))
                        //    d > 0 && o(counter(d - 1))
                      })
                    )
                  )
                })
              )
            )
          })
        )
      )
      o(
        elm(
          'button',
          N.pith(o => {
            o(text(S.at('-')))
            //    d > 0 && o(counter(d - 1))
          })
        )
      )
    })
  )

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const t0 = now()
N.run(S.at(N.pith(o => o(counter(0)))))
  .map(p => (p(rootNode), 1))
  .scan((a, b) => a + b, 0)
  .skip(1)
  .map(n => ({ n, t: now() - t0 }))
  .run(console.log.bind(console))

// S.run(
//   console.log.bind(console),
//   S.map(
//     n => ({ n, t: now() }),
//     S.skip(
//       1,
//       S.scan(
//         (a, b) => a + b,
//         0,
//         S.map(p => (p(rootNode), 1), N.run(S.at(N.pith(o => o(counter(0))))))
//       )
//     )
//   )
// )

// const s = S.take(3, S.skip(1, S.startWith(-1, S.periodic(1000))))
// S.run(console.log.bind(console), s)
