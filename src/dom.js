// @flow strict
import * as S from './stream'
import * as P from './pnode'
import { On } from './on'

export class Elm<A> {
  tag: string
  key: ?string
  piths: S.S<Pith<A>>
  constructor(
    tag: $PropertyType<Elm<A>, 'tag'>,
    key: $PropertyType<Elm<A>, 'key'>,
    piths: $PropertyType<Elm<A>, 'piths'>
  ) {
    this.tag = tag.toUpperCase()
    this.key = key
    this.piths = piths
  }
}

export class Str {
  texts: S.S<string>
  constructor(texts: $PropertyType<Str, 'texts'>) {
    this.texts = texts
  }
}

export class Pith<A> {
  pith: ((Elm<A> | Str | S.S<P.Patch | R<A>>) => void, On, S.S<A>) => void
  constructor(pith: $PropertyType<Pith<A>, 'pith'>) {
    this.pith = pith
  }
}

export class R<A> {
  r: A => A
  constructor(r: $PropertyType<R<A>, 'r'>) {
    this.r = r
  }
}

export function run<A>(piths: S.S<Pith<A>>): S.S<P.Patch | R<A>> {
  const ring = (pith: Pith<A>): P.Pith<R<A>> =>
    new P.Pith((o, ns) => {
      pith.pith(
        v => {
          if (v instanceof Str) {
            o(
              new P.PNode(
                () => document.createTextNode(''),
                n => n.nodeName === '#text',
                S.at(
                  new P.Pith(o =>
                    o(
                      v.texts.map(
                        text =>
                          new P.Patch(n => {
                            n.textContent = text
                          })
                      )
                    )
                  )
                )
              )
            )
          } else if (v instanceof Elm) {
            o(
              new P.PNode(
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
