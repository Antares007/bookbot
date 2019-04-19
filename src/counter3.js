// @flow strict
import * as S from './S'
import * as N from './piths/node'

const counter = (d: number) =>
  N.div(({ o }) => {
    o(
      N.button(({ o }) => {
        o('+')
        d > 0 &&
          o(
            S.periodic(1000)
              .skip(1)
              .map(i => (i % 2 === 0 ? counter(d - 1) : ''))
          )
      })
    )
    o(
      N.button(({ o }) => {
        o('-')
        d > 0 && o(counter(d - 1))
      })
    )
    o('0')
  })

const patches = N.run(counter(2))

const rootNode = document.getElementById('root-node')
if (!(rootNode instanceof HTMLDivElement))
  throw new Error('cant find root-node')

patches.map(p => p(rootNode)).run(console.log.bind(console))
