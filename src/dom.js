// @flow strict
import * as S from './stream'
import * as P from './pnode'
import { On } from './on'

type SS<A> = S.S<A> | A

export class DElm {
  tag: string
  key: ?string
  piths: S.S<DPith>
  constructor(
    tag: $PropertyType<DElm, 'tag'>,
    key: $PropertyType<DElm, 'key'>,
    piths: $PropertyType<DElm, 'piths'>
  ) {
    this.tag = tag.toUpperCase()
    this.key = key
    this.piths = piths
  }
}
export function elm(
  tag: string,
  piths: SS<$PropertyType<DPith, 'pith'> | DPith>,
  key?: ?string
): DElm {
  const piths_ = (piths instanceof S.S ? piths : S.at(piths)).map(x =>
    x instanceof DPith ? x : pith(x)
  )
  return new DElm(tag, key, piths_)
}

export class DStr {
  texts: S.S<string>
  constructor(texts: $PropertyType<DStr, 'texts'>) {
    this.texts = texts
  }
}
export function str(x: SS<string>): DStr {
  return new DStr(x instanceof S.S ? x : S.at(x))
}

export class DPith {
  pith: ((DElm | DStr | S.S<P.PPatch>) => void, On) => void
  constructor(pith: $PropertyType<DPith, 'pith'>) {
    this.pith = pith
  }
}
export function pith(pith: $PropertyType<DPith, 'pith'>): DPith {
  return new DPith(pith)
}

export function run(piths: SS<DPith>): S.S<P.PPatch> {
  const ring = (pith: DPith) =>
    P.pith((o, ns) => {
      pith.pith(v => {
        if (v instanceof DStr) {
          o(
            P.node(
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
        } else if (v instanceof DElm) {
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
      }, new On(ns))
    })
  return P.run(piths instanceof S.S ? piths.map(ring) : S.at(ring(piths)))
}
