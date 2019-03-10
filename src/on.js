// @flow strict
import * as S from './stream'
import * as D from './disposable'

export class On {
  ets: S.S<Node>
  constructor(ets: S.S<Node>) {
    this.ets = ets
  }
  event(name: string): S.S<Event> {
    return this.ets.flatMap(et =>
      S.s(o => {
        et.addEventListener(name, o)
        o(D.disposable(() => et.removeEventListener(name, o)))
      })
    )
  }
  click(): S.S<MouseEvent> {
    return this.ets.flatMap(et =>
      S.s(o => {
        et.addEventListener('click', o)
        o(D.disposable(() => et.removeEventListener('click', o)))
      })
    )
  }
}
