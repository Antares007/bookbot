// @flow strict

type Pith = (
  ({ R: 'node', create: () => Node, eq: Node => ?Node, b: Node => void }) => void
) => void

function bark(pith: Pith): Node => void {
  return function rb(n) {
    const { childNodes } = n
    var index = 0
    pith(r => {
      var found: ?Node = null
      for (var i = index++, l = childNodes.length; i < l; i++)
        if ((found = r.eq(childNodes[i]))) break
      if (!found) {
        found = r.create()
        n.insertBefore(found, childNodes[index])
      } else if (i > index) n.insertBefore(found, childNodes[index])
      r.b(found)
    })
    for (var i = childNodes.length - 1; i >= index; i--)
      console.log('rm', n.removeChild(childNodes[i]))
  }
}

import * as S from './tS'
import { liftBark } from './liftbark'

const sbark = liftBark(bark)
const s = sbark(o => {
  var i = 0
  o(
    S.map(
      () => ({
        R: 'node',
        create: () => document.createTextNode(''),
        eq: n => (n.nodeName === '#text' ? n : null),
        b: n => {
          n.textContent = 'hello' + i++
        }
      }),
      S.take(3, S.periodic(1000))
    )
  )
  o(
    S.map(
      b => ({
        R: 'node',
        create: () => document.createElement('h1'),
        eq: n => (n instanceof HTMLElement && n.nodeName === 'H1' ? n : null),
        b
      }),
      S.d(n => {
        n.textContent = i + ''
        console.log('patch ' + i)
      })
    )
  )
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error()

S.run(r => {
  if (r.T === 'next') r.value(rootNode)
  else console.info(r)
}, s)
