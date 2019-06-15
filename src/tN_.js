// @flow strict
import * as N from './tN'
import * as S from './tS'
import { liftBark } from './liftbark'

const sbark = liftBark(N.elementBark)

const s = sbark((o, e) => {
  o(
    S.d({
      R: 'Element',
      tag: 'div',
      b: e => {
        console.log('hmm', i)
      }
    })
  )
  o(
    S.map(
      b => ({ R: 'Element', tag: 'h1', b }),
      sbark((o, e) => {
        o(
          S.d({
            R: 'Text',
            b: n => {
              n.textContent = 'hi'
            }
          })
        )
      })
    )
  )
  var i = 0
  o(
    S.map(
      () => ({
        R: 'Text',
        b: n => {
          n.textContent = 'a' + i++
        }
      }),
      S.take(9, S.periodic(1000))
    )
  )
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

S.run(r => {
  if (r.T === 'next') r.value(rootNode)
  else console.info(r)
}, s)
