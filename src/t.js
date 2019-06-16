// @flow strict

export type RNode = { R: 'node', create: () => Node, eq: Node => boolean, b: Node => void }

export function nodeBark(pith: ((RNode) => void) => void): Node => void {
  return function rb(n) {
    const { childNodes } = n
    var index = 0
    pith(r => {
      var found: ?Node = null
      var i = index++
      const l = childNodes.length
      while (i < l && !found)
        if (r.eq(childNodes[i])) found = childNodes[i]
        else i++
      if (!found) n.insertBefore((found = r.create()), childNodes[index])
      else if (i > index) n.insertBefore(found, childNodes[index])
      r.b(found)
    })
    for (var i = childNodes.length - 1; i >= index; i--)
      console.log('rm', n.removeChild(childNodes[i]))
  }
}
