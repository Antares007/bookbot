// flow strict
import * as S from './stream'
import * as P from './pnode'
import { On } from './on'

export class ElmT<A> {
  tag: string
  piths: S.T<PithT<A>>
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
  texts: S.T<string>
  constructor(texts: $PropertyType<StrT, 'texts'>) {
    this.texts = texts
  }
}

export class PithT<A> {
  pith: ((ElmT<A> | StrT | S.T<P.PatchT | RT<A>>) => void, On, S.T<A>) => void
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

type SS<A> = S.T<A> | A

export const elm = <A>(
  tag: $PropertyType<ElmT<A>, 'tag'>,
  piths: SS<$PropertyType<PithT<A>, 'pith'> | PithT<A>>,
  key?: $PropertyType<ElmT<A>, 'key'>
): ElmT<A> =>
  new ElmT(
    tag,
    (piths instanceof S.T ? piths : S.at(piths)).map(x =>
      x instanceof PithT ? x : pith(x)
    ),
    key
  )

export const str = (texts: SS<string>): StrT =>
  new StrT(texts instanceof S.T ? texts : S.at(texts))

export const pith = <A>(pith: $PropertyType<PithT<A>, 'pith'>): PithT<A> =>
  new PithT(pith)

export const r = <A>(r: $PropertyType<RT<A>, 'r'>): RT<A> => new RT(r)

export function run<A>(piths: S.T<PithT<A>>): S.T<P.PatchT | RT<A>> {
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
