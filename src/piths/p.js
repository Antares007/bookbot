// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'
import { cast } from '../cast'

type SS<A> = S.S<A> | A

export class Pith<I, O> {
  f: ((SS<O>) => void, S.S<I>) => void
  constructor(f: $PropertyType<Pith<I, O>, 'f'>) {
    this.f = f
  }
}

export class Patch<N: Node> {
  f: N => void
  constructor(f: $PropertyType<Patch<N>, 'f'>) {
    this.f = f
  }
}

export class NPith<N: Node, I, O> extends Pith<
  I,
  O | Patch<N> | string | Div<I, O> | Button<I, O>
> {}

export class Div<I, O> extends NPith<HTMLDivElement, I, O> {}

export class Button<I, O> extends NPith<HTMLButtonElement, I, O> {}

let counter = (d: number) =>
  new Div((o, i) => {
    o(
      new Button((o, i) => {
        o('+')
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      new Button((o, i) => {
        o('-')
        d > 0 && o(counter(d - 1))
      })
    )
  })

run(counter(3))

function run<N: Node>(pith: NPith<N, void, void>) {}
