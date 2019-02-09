// @flow
import { S, Of, event } from './stream'
export type On = {
  (MouseEventTypes): S<MouseEvent>,
  (FocusEventTypes): S<FocusEvent>,
  (KeyboardEventTypes): S<KeyboardEvent>,
  //(InputEventTypes): S<InputEvent>,
  (TouchEventTypes): S<TouchEvent>,
  (WheelEventTypes): S<WheelEvent>,
  (AbortProgressEventTypes): S<ProgressEvent>,
  (ProgressEventTypes): S<ProgressEvent>,
  (DragEventTypes): S<DragEvent>,
  (PointerEventTypes): S<PointerEvent>,
  (AnimationEventTypes): S<AnimationEvent>,
  (ClipboardEventTypes): S<ClipboardEvent>,
  //(TransitionEventTypes): S<TransitionEvent>,
  //(MessageEventTypes): S<MessageEvent>
  (string): S<Event>
}

export const mkOn = (elm: HTMLElement): On => (name: string): S<any> => {
  return Of((o, schedule) => {
    const listener = (e: Event) => o(event(schedule.now(), e))
    elm.addEventListener(name, listener)
    return {
      dispose() {
        elm.removeEventListener(name, listener)
      }
    }
  })
}
