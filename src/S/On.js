// @flow strict
import * as S from './S'
import * as D from './Disposable'

export class On {
  ets: S.S<Node>
  constructor(ets: S.S<Node>) {
    this.ets = ets
  }
  event(name: string): S.S<Event> {
    return this.ets.flatMap(et =>
      S.s(o => {
        const handler = (e: Event) => o(S.event(e))
        et.addEventListener(name, handler)
        o(D.create(() => et.removeEventListener(name, handler)))
      })
    )
  }
  click(): S.S<MouseEvent> {
    return this.ets.flatMap(et =>
      S.s(o => {
        const handler = (e: MouseEvent) => o(S.event(e))
        et.addEventListener('click', handler)
        o(D.create(() => et.removeEventListener('click', handler)))
      })
    )
  }
}
