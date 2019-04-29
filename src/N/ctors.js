// @flow strict
import * as S from '../S'
import type { N, NPith } from './N'
import type { SS } from './streamstaff'
import { ssmap, combineSS } from './streamstaff'
import { text, elm } from './N'
import { cast } from './cast'

export type DPith<State, Elm: Node> = (
  {
    (...Array<SS<N<State> | string>>): void,
    style: (SS<{ [string]: ?string }>) => void,
    attrs: (SS<{ [string]: ?string }>) => void,
    props: (SS<{ [string]: mixed }>) => void,
    patch: (SS<(Elm) => void>) => void,
    reduce: (SS<(State) => State>) => void
  },
  { ref: S.S<Elm>, on: S.On, states: S.S<State> }
) => void

export const div = <State>(pith: DPith<State, HTMLDivElement>, key?: ?string): N<State> =>
  elm('div', pmap(HTMLDivElement, pith), key)
export const button = <State>(pith: DPith<State, HTMLButtonElement>, key?: ?string): N<State> =>
  elm('button', pmap(HTMLButtonElement, pith), key)
export const input = <State>(pith: DPith<State, HTMLInputElement>, key?: ?string): N<State> =>
  elm('input', pmap(HTMLInputElement, pith), key)
export const ul = <State>(pith: DPith<State, HTMLUListElement>, key?: ?string): N<State> =>
  elm('ul', pmap(HTMLUListElement, pith), key)
export const li = <State>(pith: DPith<State, HTMLLIElement>, key?: ?string): N<State> =>
  elm('li', pmap(HTMLLIElement, pith), key)

function pmap<State, T: Node>(klass: Class<T>, pith: DPith<State, T>): NPith<State> {
  return (o, i) => {
    const ssstyle = []
    const ssattrs = []
    const ssprops = []
    pith(
      Object.assign(
        (...vs) => vs.forEach(v => o(ssmap(v => (typeof v === 'string' ? text(v) : v), v))),
        {
          patch: v => o.patch(ssmap(v => p => (p instanceof klass ? v(p) : void 0), v)),
          reduce: o.reduce,
          style: v => {
            ssstyle.push(v)
          },
          attrs: v => {
            ssattrs.push(v)
          },
          props: v => {
            ssprops.push(v)
          }
        }
      ),
      {
        ref: i.ref.filterJust(x => (x instanceof klass ? x : null)),
        states: i.states,
        on: new S.On(i.ref)
      }
    )
    if (ssstyle.length > 0)
      o.patch(
        combineSS(ssstyle).filterJust(v => parent => {
          if (!(parent instanceof HTMLElement)) return
          for (var styles of v.type === 'init' ? v.v : [v.v])
            for (var name in styles)
              if (styles[name] != null) parent.style.setProperty(name, styles[name])
              else parent.style.removeProperty(name)
        })
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
