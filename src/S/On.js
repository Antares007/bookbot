import * as S from './S'
import * as D from './Disposable'

export class On {
  constructor(ets) {
    this.ets = ets
  }
  event(name) {
    return this.ets.flatMap(et =>
      S.s(o => {
        const handler = e => o(S.next(e))
        et.addEventListener(name, handler)
        o(D.create(() => et.removeEventListener(name, handler)))
      })
    )
  }
  click() {
    return this.event('click')
  }
  input() {
    return this.event('input')
  }
}
