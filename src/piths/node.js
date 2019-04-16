// @flow
import * as S from '../S'

type SS<A> = S.S<A> | A

export class NPith<T: Node> {
  pith: ({ o: (SS<Nodes>) => void, patch: (SS<(T) => void>) => void }) => void
  constructor(pith: $PropertyType<NPith<T>, 'pith'>) {
    this.pith = pith
  }
}

type Nodes = Div | Button | string

export class Div extends NPith<HTMLDivElement> {}
export class Button extends NPith<HTMLButtonElement> {}

export const div = (pith: $PropertyType<Div, 'pith'>): Div => new Div(pith)

export const button = (pith: $PropertyType<Button, 'pith'>): Button =>
  new Button(pith)

const ring = <N: Node>(
  p: (
    { o: (SS<Nodes>) => void, patch: (SS<(N => void) | boolean>) => void },
    number
  ) => void
): $PropertyType<NPith<N>, 'pith'> => {
  return o => {}
}

const see = div(
  ring(({ o, patch }, i) => {
    patch(a => {})
    patch(true)
    o(
      button(
        ring(({ o, patch }, i) => {
          patch(n => {})
        })
      )
    )
    o(div(({ o, patch }, i) => {}))
  })
)

const counter = (d: number) =>
  div(({ o }) => {
    o(
      button(({ o }) => {
        o('+')
        d > 0 && o(counter(d - 1))
      })
    )
    o(
      button(({ o }) => {
        o('-')
        d > 0 && o(counter(d - 1))
      })
    )
    o('0')
  })

function run<N: Node>(ps: S.S<NPith<N>>): S.S<(N) => void> {
  return S.s(o => {
    o(
      S.run(e => {
        if (e instanceof S.Next) {
          var i = 0
          e.value.pith({
            o: v => {
              const sv = v instanceof S.S ? v : S.d(v)
            },
            patch: v => {
              const sv = v instanceof S.S ? v : S.d(v)
            }
          })
        } else o(e)
      }, ps)
    )
    //
  })

  //return (pith instanceof S.S ? pith : S.d(pith)).flatMapLatest(pith => {
  //  const nodes = []
  //  const patches = []
  //  pith.pith({
  //    o: v => {
  //      nodes.push(v instanceof S.S ? v : S.d(v))
  //    },
  //    patch: v => {
  //      patches.push(v instanceof S.S ? v : S.d(v))
  //    }
  //  })
  //  S.s(o => {
  //    //
  //  })
  //  const init = S.combine(nodes => {}, nodes)
  //    .take(1)
  //    .multicast()

  //  return S.d(1)
  //})
}

run(S.d(counter(3)))
