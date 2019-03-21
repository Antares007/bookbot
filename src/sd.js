// flow strict
import * as S from './stream'
import * as P from './pnode'
import { On } from './on'

type SD$Pith<S> = (
  (P.NodeT<SDR<S>> | S.T<P.PatchT, SDR<S>>) => void,
  S.T<Node>
) => void

export class SDR<S> {
  r: S => S
  constructor(r: S => S) {
    this.r = r
  }
}

export class ElmT<A> {
  tag: string
  ray: S.T<P.PatchT | SDR<A>>
  key: ?string
  constructor(tag: string, ray: S.T<P.PatchT | SDR<A>>, key: ?string) {
    this.tag = tag.toUpperCase()
    this.key = key
    this.ray = ray
  }
}

export class StrT {
  texts: S.T<string>
  constructor(texts: $PropertyType<StrT, 'texts'>) {
    this.texts = texts
  }
}

export function bark<S>(s: S, pith: SD$Pith<S>): S.T<P.PatchT | SDR<S>> {
  let see = P.bark((o, ref) => {})
  return see //.map(x => x)
}
