// @flow
import * as S from './S'
import * as SN from './N/SN'
import type { SN as SNT } from './N/SN'
import * as N from './N/N'
import { extend } from './N/rings'
import type { SS } from './N/streamstaff'
import { ssmap } from './N/streamstaff'

const pi2 = Math.PI * 2
const r = 10

const button = (label, action, styles, depth) =>
  SN.elm('button', (o, i) => {
    const on = new S.On(i.ref)
    o(N.text(label))
    o.patch(style({ position: 'relative', outline: 'none' }))
    o.patch(style(styles))
    o.reduce(
      on
        .click()
        .tap(x => console.log('click ' + depth))
        .map(_ => s => ({ ...s, n: s.n + action }))
    )
    depth > 0 && o(extend(label, { n: 0 })(counter(depth - 1)))
  })

const counter = (depth: number): SN.SN<{ n: number }> =>
  SN.elm('div', (o, i) => {
    o.patch(style({ padding: '5px 10px', 'text-align': 'center' }))
    const colors = S.periodic(20)
      .take(1)
      .scan(i => (i >= pi2 ? 0 : i + 0.15), 0)
      .map(i => {
        const s = Math.sin(i)
        const c = Math.cos(i)
        const c1 = 100 + depth * 20 + Math.floor(30 * s)
        const c2 = 100 + depth * 20 + Math.floor(30 * c)
        return { s, c, c1, c2 }
      })

    o(
      button(
        '+',
        1,
        S.map(({ s, c, c1, c2 }) => {
          return {
            'border-radius': Math.abs(Math.floor(s * 20)) + 'px',
            //left: Math.floor(r * c) + 'px',
            //top: Math.floor(r * s) + 'px',
            'background-color': `rgb(255, ${c1}, ${c2})`
          }
        }, colors),
        depth
      )
    )
    o(
      button(
        '-',
        -1,
        S.map(({ s, c, c1, c2 }) => {
          return {
            'border-radius': Math.abs(Math.floor(c * 20)) + 'px',
            //left: Math.floor(r * s) + 'px',
            //top: Math.floor(r * c) + 'px',
            'background-color': `rgb(${c1}, ${c2}, 255)`
          }
        }, colors),
        depth
      )
    )
    o(N.elm('h4', o => o(i.states.map(s => N.text(s.n + '')))))
  })

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const states = SN.run(linearPatcher(rootNode), { n: 0, b: true }, counter(4))

states.run(e => {
  if (e instanceof S.Next) console.log(JSON.stringify(e.value, null, '  '))
  else if (e instanceof Error) console.error(e)
  else console.info(e)
})

function animationFramePatcher(node: Node): ((Node) => void) => void {
  var patches = []
  window.requestAnimationFrame(function rec() {
    var p
    while ((p = patches.shift())) p(node)
    window.requestAnimationFrame(rec)
  })
  return p => {
    patches.push(p)
  }
}

function linearPatcher(node: Node, speed: number = 17): ((Node) => void) => void {
  const patches = []
  window.speed = speed
  S.delay(function rec() {
    const p = patches.shift()
    if (p) {
      console.log(p.toString())
      p(node)
    }
    S.delay(rec, window.speed)
  })
  return p => {
    patches.push(p)
  }
}

function style(styles: SS<{ [string]: ?string }>): SS<(Node) => void> {
  return ssmap(
    styles => parent => {
      if (parent instanceof HTMLElement)
        for (var name in styles)
          if (styles[name] != null) parent.style.setProperty(name, styles[name])
          else parent.style.removeProperty(name)
    },
    styles
  )
}

function attr(attrs: SS<{ [string]: ?string }>): SS<(Node) => void> {
  return ssmap(
    attrs => parent => {
      if (parent instanceof Element)
        for (var name in attrs)
          if (attrs[name] != null) parent.setAttribute(name, attrs[name])
          else parent.removeAttribute(name)
    },
    attrs
  )
}

function prop(props: SS<{ [string]: mixed }>): SS<(Node) => void> {
  return ssmap(
    props => (parent: Node & { [string]: mixed }) => {
      for (var name in props) parent[name] = props[name]
    },
    props
  )
}
