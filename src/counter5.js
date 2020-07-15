// @flow strict
const elm = (tag, pith) => ({ tag, pith })
const button = (pith) => elm('button', pith)
const div = (pith) => elm('div', pith)
const counter = (d = 3) => (o, s) => {
  o(
    button((o, s) => {
      o('+')
      if (d > 0) o(div(counter(d - 1)))
    })
  )
  o(
    button((o, s) => {
      o('-')
      if (d > 0) o(div(counter(d - 1)))
    })
  )
  o(s.n + d + '')
}
const mkpith = (elm: HTMLElement, state) => {
  return function pith(x) {
    if (typeof x === 'function') {
      x(pith, state)
      pith()
    } else if (x == null) {
    } else if (typeof x === 'string') {
      const text = document.createTextNode(x)
      elm.insertBefore(text, null)
    } else {
      const btn = document.createElement(x.tag)
      const o = mkpith(btn, state)
      elm.insertBefore(btn, null)
      o(x.pith)
    }
  }
}
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')
mkpith(rootNode, { n: 9 })(counter(2))
