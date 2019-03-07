// @flow
import * as S from './stream'
import * as D from './disposable'

export type On = {
  (MouseEventTypes): S.S<MouseEvent>,
  (FocusEventTypes): S.S<FocusEvent>,
  (KeyboardEventTypes): S.S<KeyboardEvent>,
  (InputEventTypes): S.S<InputEvent>,
  (TouchEventTypes): S.S<TouchEvent>,
  (WheelEventTypes): S.S<WheelEvent>,
  (AbortProgressEventTypes): S.S<ProgressEvent>,
  (ProgressEventTypes): S.S<ProgressEvent>,
  (DragEventTypes): S.S<DragEvent>,
  (PointerEventTypes): S.S<PointerEvent>,
  (AnimationEventTypes): S.S<AnimationEvent>,
  (ClipboardEventTypes): S.S<ClipboardEvent>,
  (TransitionEventTypes): S.S<TransitionEvent>,
  (MessageEventTypes): S.S<MessageEvent>,
  (string): S.S<Event>
}

export const mkOn = (elm: EventTarget): On => (name: string): S.S<any> => {
  return S.s(o => {
    const listener = (e: Event) => o(e)
    elm.addEventListener(name, listener)
    o(
      D.disposable(() => {
        elm.removeEventListener(name, listener)
      })
    )
  })
}
