// @flow strict
import * as S from './stream'
import * as D from './disposable'

export class On {
  et: EventTarget
  constructor(eventTarget: EventTarget) {
    this.et = eventTarget
  }
  event(name: string): S.S<Event> {
    return S.s(o => {
      this.et.addEventListener(name, o)
      o(D.disposable(() => this.et.removeEventListener(name, o)))
    })
  }
  click(): S.S<MouseEvent> {
    return S.s(o => {
      this.et.addEventListener('click', o)
      o(D.disposable(() => this.et.removeEventListener('click', o)))
    })
  }
}
