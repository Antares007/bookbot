// @flow strict
import * as S from './S'
import * as D from './disposable'

export class On {
  ets: S.T<Node>
  constructor(ets: S.T<Node>) {
    this.ets = ets
  }
  event(name: string): S.T<Event> {
    return this.ets.flatMap(et =>
      S.s(o => {
        const handler = (e: Event) => o(S.event(e))
        et.addEventListener(name, handler)
        o(D.disposable(() => et.removeEventListener(name, handler)))
      })
    )
  }
  click(): S.T<MouseEvent> {
    return this.ets.flatMap(et =>
      S.s(o => {
        const handler = (e: MouseEvent) => o(S.event(e))
        et.addEventListener('click', handler)
        o(D.disposable(() => et.removeEventListener('click', handler)))
      })
    )
  }
}
