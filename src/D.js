// @flow strict
import * as S from './S'
import type { N, NPith } from './N'
import type { SS } from './N/streamstaff'
import { ssmap, combineSS } from './N/streamstaff'
import { runO, elm, text, comment } from './N'
import { cast } from './N/cast'

export type DPith<State, Elm: Node> = (
  {
    (...Array<SS<D<State>>>): void,
    n: (SS<N<State>>) => void,
    attrs: (SS<{ [string]: ?string }>) => void,
    props: (SS<{ [string]: mixed }>) => void,
    patch: (SS<(Elm) => void>) => void,
    reduce: (SS<(State) => State>) => void
  },
  { ref: S.S<Elm>, on: S.On, states: S.S<State> }
) => void

export type D<State> =
  | N<State>
  | string
  | { type: 'div', pith: DPith<State, HTMLDivElement>, key: ?string }
  | { type: 'button', pith: DPith<State, HTMLButtonElement>, key: ?string }
  | { type: 'ul', pith: DPith<State, HTMLUListElement>, key: ?string }
  | { type: 'li', pith: DPith<State, HTMLLIElement>, key: ?string }
  | { type: 'input', pith: DPith<State, HTMLInputElement>, key: ?string }

export const div = <State>(pith: DPith<State, HTMLDivElement>, key?: ?string): D<State> => ({
  type: 'div',
  pith,
  key
})
export const button = <State>(pith: DPith<State, HTMLButtonElement>, key?: ?string): D<State> => ({
  type: 'button',
  pith,
  key
})
export const ul = <State>(pith: DPith<State, HTMLUListElement>, key?: ?string): D<State> => ({
  type: 'ul',
  pith,
  key
})
export const li = <State>(pith: DPith<State, HTMLLIElement>, key?: ?string): D<State> => ({
  type: 'li',
  pith,
  key
})
export const input = <State>(pith: DPith<State, HTMLInputElement>, key?: ?string): D<State> => ({
  type: 'input',
  pith,
  key
})

export function ring<State>(d: D<State>): N<State> {
  if (typeof d === 'string') return text(d)
  switch (d.type) {
    case 'element':
    case 'text':
    case 'comment':
      return d
    case 'div':
      return elm(d.type, pmap(HTMLDivElement, d.pith), d.key)
    case 'button':
      return elm(d.type, pmap(HTMLButtonElement, d.pith), d.key)
    case 'ul':
      return elm(d.type, pmap(HTMLUListElement, d.pith), d.key)
    case 'li':
      return elm(d.type, pmap(HTMLLIElement, d.pith), d.key)
    case 'input':
      return elm(d.type, pmap(HTMLInputElement, d.pith), d.key)
    default:
      throw new Error(`case [${d.type}] not implemented`)
  }
}

function pmap<State, T: Node>(klass: Class<T>, pith: DPith<State, T>): NPith<State> {
  return (o, i) => {
    const ssattrs = []
    const ssprops = []
    pith(
      Object.assign((...v) => v.forEach(v => o(ssmap(ring, v))), {
        n: o,
        patch: v => o.patch(ssmap(v => p => (p instanceof klass ? v(p) : void 0), v)),
        reduce: o.reduce,
        attrs: v => {
          ssattrs.push(v)
        },
        props: v => {
          ssprops.push(v)
        }
      }),
      {
        ref: i.ref.filterJust(x => (x instanceof klass ? x : null)),
        states: i.states,
        on: new S.On(i.ref)
      }
    )
    if (ssattrs.length > 0)
      o.patch(
        combineSS(ssattrs).filterJust(v => parent => {
          if (!(parent instanceof Element)) return
          for (var attrs of v.type === 'init' ? v.v : [v.v])
            for (var name in attrs)
              if (attrs[name] != null) parent.setAttribute(name, attrs[name])
              else parent.removeAttribute(name)
        })
      )
    if (ssprops.length > 0)
      o.patch(
        combineSS(ssprops).filterJust(v => parent => {
          const p: { [string]: mixed } = cast(parent)
          for (var props of v.type === 'init' ? v.v : [v.v])
            for (var name in props) {
              p[name] = props[name]
            }
        })
      )
  }
}
