// @flow strict
import * as S from './t'
import * as D from './S/Disposable'
import type { Pith } from './pith'

export type SS<+A> = S.S<A> | A

export type NORay = { T: 'patch', s: S.S<(Node) => void> } | { T: 'node', s: S.S<N> }

export type NIRay = { ref: S.S<Node> }

export opaque type R: { R: 'patch', r: Node => void } = { R: 'patch', r: Node => void }

export type N =
  | { T: 'element', tag: string, s: HTMLElement => D.Disposable, key: ?string }
  | { T: 'elementNS', tag: string, s: Element => D.Disposable, ns: string }
  | { T: 'text', tag: '#text', s: Text => D.Disposable }
  | { T: 'comment', tag: '#comment', s: Comment => D.Disposable }

export type NPith = Pith<NORay, NIRay, void>

export const patch = (s: S.S<(Node) => void>): NORay => ({ T: 'patch', s })
export const node = (ss: SS<N>): NORay => ({
  T: 'node',
  s: ss.T === 's' ? ss : S.d(ss)
})
export const elm = (tag: string, pith: NPith, key?: string): N => ({
  T: 'element',
  tag: tag.toUpperCase(),
  s: elementBark(pith),
  key
})
export const elmNS = (ns: string, tag: string, pith: NPith): N => ({
  T: 'elementNS',
  tag: tag.toUpperCase(),
  s: elementBark(pith),
  ns
})
export const text = (ss: SS<string>): N => ({
  T: 'text',
  tag: '#text',
  s: characterDataBark(typeof ss === 'string' ? S.d(ss) : ss)
})
export const comment = (ss: SS<string>): N => ({
  T: 'comment',
  tag: '#comment',
  s: characterDataBark(typeof ss === 'string' ? S.d(ss) : ss)
})

export function characterDataBark<T: CharacterData>(s: S.S<string>): T => D.Disposable {
  return charData =>
    S.run(r => {
      if (r.T === 'end') return
      const text = r.T === 'next' ? r.value : r.error.message
      charData.textContent !== text && (charData.textContent = text)
    }, s)
}

export function elementBark<Elm: Element>(pith: NPith): Elm => D.Disposable {
  return elm => {
    pith(
      r => {
        if (r.T === 'node') {
          S.map(n => {}, r.s)
        } else {
          S.run(r => {}, r.s)
        }
      },
      { ref: S.empty }
    )
    return D.empty
  }
}
