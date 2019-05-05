// @flow strict
import type { SNPith, SN } from './SN'
import type { SS } from './streamstaff'

import * as S from '../S'
import { text } from './N'
import { elm } from './SN'
import { ssmap } from './streamstaff'

export type DPith<State, Elm: Node> = (
  {
    (...Array<SS<SN<State> | string>>): void,
    style: (SS<{ [string]: ?string }>) => void,
    attrs: (SS<{ [string]: ?string }>) => void,
    props: (SS<{ [string]: mixed }>) => void,
    patch: (SS<(Elm) => void>) => void,
    reduce: (SS<(State) => State>) => void
  },
  { ref: S.S<Elm>, on: S.On, states: S.S<State> }
) => void

export const div = <State>(pith: DPith<State, HTMLDivElement>, key?: ?string): SN<State> =>
  elm('div', pmap(HTMLDivElement, pith), key)

export const button = <State>(pith: DPith<State, HTMLButtonElement>, key?: ?string): SN<State> =>
  elm('button', pmap(HTMLButtonElement, pith), key)

export const input = <State>(pith: DPith<State, HTMLInputElement>, key?: ?string): SN<State> =>
  elm('input', pmap(HTMLInputElement, pith), key)

export const ul = <State>(pith: DPith<State, HTMLUListElement>, key?: ?string): SN<State> =>
  elm('ul', pmap(HTMLUListElement, pith), key)

export const li = <State>(pith: DPith<State, HTMLLIElement>, key?: ?string): SN<State> =>
  elm('li', pmap(HTMLLIElement, pith), key)

export const h4 = <State>(pith: DPith<State, HTMLAnchorElement>, key?: ?string): SN<State> =>
  elm('h4', pmap(HTMLAnchorElement, pith), key)

function pmap<State, T: Node>(klass: Class<T>, pith: DPith<State, T>): SNPith<State> {
  return (o, i) => {
    pith(
      Object.assign(
        (...vs) => vs.forEach(v => o(ssmap(v => (typeof v === 'string' ? text(v) : v), v))),
        {
          patch: v => o.patch(ssmap(v => p => (p instanceof klass ? v(p) : void 0), v)),
          reduce: o.reduce,
          style: v => o.patch(style(v)),
          attrs: v => o.patch(attr(v)),
          props: v => o.patch(prop(v))
        }
      ),
      {
        ref: i.ref.filterJust(x => (x instanceof klass ? x : null)),
        states: i.states,
        on: new S.On(i.ref)
      }
    )
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
