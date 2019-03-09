// @flow strict
import * as S from './stream'
import * as P from './pnode'
import { On } from './on'

type SS<A> = S.S<A> | A

export class DElm<A> {
  tag: string
  key: ?string
  piths: S.S<DPith<A>>
  constructor(
    tag: $PropertyType<DElm<A>, 'tag'>,
    key: $PropertyType<DElm<A>, 'key'>,
    piths: $PropertyType<DElm<A>, 'piths'>
  ) {
    this.tag = tag.toUpperCase()
    this.key = key
    this.piths = piths
  }
}
export function elm<A>(
  tag: string,
  piths: SS<$PropertyType<DPith<A>, 'pith'> | DPith<A>>,
  key?: string
): DElm<A> {
  const piths_ = (piths instanceof S.S ? piths : S.at(piths)).map(x =>
    x instanceof DPith ? x : pith(x)
  )
  return new DElm<A>(tag, key, piths_)
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

export class DPith<A> {
  pith: ((DElm<A> | DStr | S.S<A>) => void, S.S<On>) => void
  constructor(pith: $PropertyType<DPith<A>, 'pith'>) {
    this.pith = pith
  }
}
export function pith<A>(pith: $PropertyType<DPith<A>, 'pith'>): DPith<A> {
  return new DPith<A>(pith)
}

export function run<A>(piths: SS<DPith<A>>): S.S<P.PPatch | A> {
  const ring = (pith: DPith<A>) =>
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
          o(v.map(a => a))
        }
      }, ns.map(node => new On(node)))
    })
  return P.run(piths instanceof S.S ? piths.map(ring) : S.at(ring(piths)))
}
