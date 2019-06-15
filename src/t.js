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
    for (var i = childNodes.length - 1; i >= index; i--) n.removeChild(childNodes[i])
  }
}

bark(o => {
  o({
    R: 'node',
    create: () => document.createTextNode(''),
    eq: n => null,
    b: n => {
      n.textContent
    }
  })
  o({
    R: 'node',
    create: () => document.createElement('div'),
    eq: n => (n instanceof HTMLElement ? n : null),
    b: bark(o => {
      //
    })
  })
})
