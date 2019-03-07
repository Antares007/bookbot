// @flow strict-local
import * as S from './stream'
import * as P from './pnode'
import type { On } from './on'
import { mkOn } from './on'

type SS<A> = S.S<A> | A

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
export function elm<A>(
  tag: string,
  piths: SS<$PropertyType<Pith<A>, 'pith'> | Pith<A>>,
  key?: string
): Elm<A> {
  const piths_ = (piths instanceof S.S ? piths : S.at(piths)).map(x =>
    x instanceof Pith ? x : pith(x)
  )
  return new Elm<A>(tag, key, piths_)
}

export class Str {
  texts: S.S<string>
  constructor(texts: $PropertyType<Str, 'texts'>) {
    this.texts = texts
  }
}
export function str(x: SS<string>): Str {
  return new Str(x instanceof S.S ? x : S.at(x))
}

export class Pith<A> {
  pith: ((Elm<A> | Str | S.S<A>) => void, S.S<On>) => void
  constructor(pith: $PropertyType<Pith<A>, 'pith'>) {
    this.pith = pith
  }
}
export function pith<A>(pith: $PropertyType<Pith<A>, 'pith'>): Pith<A> {
  return new Pith<A>(pith)
}

export function run<A>(piths: SS<Pith<A>>): S.S<P.Patch | A> {
  var O
  const proxy = S.s(o_ => {
    O = o_
  })
  const ring = (pith: Pith<A>) =>
    P.pith((o, ns) => {
      pith.pith(v => {
        if (v instanceof Str) {
          o(
            P.pnode(
              () => document.createTextNode(''),
              n => n.nodeName === '#text',
              o =>
                o(
                  v.texts.map(text =>
                    P.patch(n => {
                      n.textContent = text
                    })
                  )
                )
            )
          )
        } else if (v instanceof Elm) {
          o(
            P.pnode(
              () => {
                const elm = document.createElement(v.tag)
                if (v.key) elm.dataset.key = v.key
                return elm
              },
              n =>
                n.nodeName === v.tag &&
                (v.key == null ||
                  (n instanceof HTMLElement && n.dataset.key === v.key)),
              v.piths.map(ring).map(p => (o, ns) => {
                p.pith(o, ns)
              })
            )
          )
        } else {
          o(v.map((a: A) => a))
        }
      }, ns.map(mkOn))
    })
  return P.run(piths instanceof S.S ? piths.map(ring) : S.at(ring(piths)))
}

// export class Attr {
//   map: { [string]: ?string }
//   constructor(map: $PropertyType<Attr, 'map'>) {
//     this.map = map
//   }
// }
// export function attr(map: $PropertyType<Attr, 'map'>): Attr {
//   return new Attr(map)
// }
//
// export class Style {
//   map: { [$Keys<CSSStyleDeclaration>]: ?string }
//   constructor(map: $PropertyType<Style, 'map'>) {
//     this.map = map
//   }
// }
// export function style(map: $PropertyType<Style, 'map'>): Style {
//   return new Style(map)
// }
//
// export class Action<A> {
//   map: { [MouseEventTypes | string]: ?(Event) => A }
//   constructor(map: $PropertyType<Action<A>, 'map'>) {
//     this.map = map
//   }
// }
// export function action<A>(map: $PropertyType<Action<A>, 'map'>): Action<A> {
//   return new Action(map)
// }
