// @flow strict
import * as S from './stream'
import * as P from './pnode'
import { On } from './on'

export class ElmT<A> {
  tag: string
  piths: S.S<PithT<A>>
  key: ?string
  constructor(
    tag: $PropertyType<ElmT<A>, 'tag'>,
    piths: $PropertyType<ElmT<A>, 'piths'>,
    key?: $PropertyType<ElmT<A>, 'key'>
  ) {
    this.tag = tag.toUpperCase()
    this.key = key
    this.piths = piths
  }
}

export class StrT {
  texts: S.S<string>
  constructor(texts: $PropertyType<StrT, 'texts'>) {
    this.texts = texts
  }
}

export class PithT<A> {
  pith: ((ElmT<A> | StrT | S.S<P.PatchT | RT<A>>) => void, On, S.S<A>) => void
  constructor(pith: $PropertyType<PithT<A>, 'pith'>) {
    this.pith = pith
  }
}

export class RT<A> {
  r: A => A
  constructor(r: $PropertyType<RT<A>, 'r'>) {
    this.r = r
  }
}

export const elm = <A>(
  tag: $PropertyType<ElmT<A>, 'tag'>,
  piths: $PropertyType<ElmT<A>, 'piths'>,
  key?: $PropertyType<ElmT<A>, 'key'>
): ElmT<A> => new ElmT(tag, piths, key)

export const str = (texts: $PropertyType<StrT, 'texts'>): StrT =>
  new StrT(texts)

export const pith = <A>(pith: $PropertyType<PithT<A>, 'pith'>): PithT<A> =>
  new PithT(pith)

export const r = <A>(r: $PropertyType<RT<A>, 'r'>): RT<A> => new RT(r)

export function run<A>(piths: S.S<PithT<A>>): S.S<P.PatchT | RT<A>> {
  const ring = (pith: PithT<A>): P.PithT<RT<A>> =>
    P.pith((o, ns) => {
      pith.pith(
        v => {
          if (v instanceof StrT) {
            o(
              P.node(
                () => document.createTextNode(''),
                n => n.nodeName === '#text',
                S.at(
                  P.pith(o =>
                    o(
                      v.texts.map(text =>
                        P.patch(n => {
                          n.textContent = text
                        })
                      )
                    )
                  )
                )
              )
            )
          } else if (v instanceof ElmT) {
            o(
              P.node(
                () => {
                  const elm = document.createElement(v.tag)
                  if (v.key) elm.dataset.key = v.key
                  return elm
                },
                n =>
                  n.nodeName === v.tag &&
                  (v.key == null ||
                    (n instanceof HTMLElement && n.dataset.key === v.key)),
                v.piths.map(ring)
              )
            )
          } else {
            o(v)
          }
        },
        new On(ns),
        S.s(() => {})
      )
    })
  return P.run(piths.map(ring))
}
