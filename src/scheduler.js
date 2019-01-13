//@flow
import type { IO } from "./io.js"
import type { Disposable } from "./disposable.js"
import type { Timeline } from "./timeline.js"
import * as disposable from "./disposable.js"
import * as timeLine from "./timeline.js"

export opaque type O =
  | { tag: "Local", io: IO<number, O, void> }
  | { tag: "Origin", io: IO<number, O, void> }
  | { tag: "Delay", delay: number, io: IO<number, O, void> }

export const Local: (IO<number, O, void>) => O = io => ({ tag: "Local", io })
export const Origin: (IO<number, O, void>) => O = io => ({ tag: "Origin", io })
export const Delay: number => (IO<number, O, void>) => O = delay => io => ({
  tag: "Delay",
  delay,
  io
})

type CancelRef = { value: boolean }

const cancelOffsetRing: (
  CancelRef,
  number,
  IO<number, O, void>
) => IO<number, O, void> = (canceled, offset, io) => o => i =>
  canceled.value
    ? void 0
    : io(v => {
        switch (v.tag) {
          case "Local":
            o(Local(cancelOffsetRing(canceled, 0 - i, v.io)))
            break
          case "Origin":
            o(Origin(cancelOffsetRing(canceled, 0, v.io)))
            break
          case "Delay":
            o(Delay(v.delay)(cancelOffsetRing(canceled, offset, v.io)))
            break
          default:
            throw new Error("never")
        }
      })(i + offset)

const runAllNows: (
  [number, IO<number, O, void>]
) => IO<void, [number, IO<number, O, void>], void> = pair => oo => () => {
  const ring = io => o => () => {
    io(v => {
      switch (v.tag) {
        case "Local":
        case "Origin":
          ring(v.io)(oo)()
          break
        case "Delay":
          o([v.delay + pair[0], v.io])
          break
        default:
          throw new Error("never")
      }
    })(pair[0])
  }
  ring(pair[1])(oo)()
}

export function mkScheduler<H>(
  tf: () => number,
  requestNextFrame: (() => void) => H
): O => Disposable {
  var now = -1
  var mainTimeLine: ?Timeline<IO<number, O, void>> = null
  var h: ?H = null
  const ioAppend = (l, r) => o => i => {
    l(o)(i)
    r(o)(i)
  }
  const onNextFrame = () => {
    console.group("." + now)
    now = tf()
    if (mainTimeLine && timeLine.getBounds(mainTimeLine)[0] <= now) {
      const mtl = mainTimeLine
      mainTimeLine = (null: ?Timeline<IO<number, O, void>>)
      var tl1 = (null: ?Timeline<IO<number, O, void>>)
      const tl2 = timeLine.fromIO(ioAppend, o => () => {
        tl1 = timeLine.runTo(ioAppend, now, mtl)(v => runAllNows(v)(o)())()
      })
      const tl =
        tl1 != null && tl2 != null
          ? timeLine.mappend(ioAppend, tl1, tl2)
          : tl1 != null
          ? tl1
          : tl2
      mainTimeLine =
        tl != null && mainTimeLine != null
          ? timeLine.mappend(ioAppend, mainTimeLine, tl)
          : tl != null
          ? tl
          : mainTimeLine
    }
    if (mainTimeLine) {
      h = requestNextFrame(onNextFrame)
    } else {
      h = null
    }
    console.groupEnd()
  }
  return v => {
    console.group(">")
    if (h == null) {
      now = tf()
      h = requestNextFrame(onNextFrame)
    }
    const canceled: CancelRef = { value: false }
    const io =
      v.tag === "Local"
        ? cancelOffsetRing(canceled, 0 - now, v.io)
        : v.tag === "Origin"
        ? cancelOffsetRing(canceled, 0, v.io)
        : cancelOffsetRing(canceled, 0 - now, o => i => o(Delay(v.delay)(v.io)))
    const tl = timeLine.fromIO(ioAppend, runAllNows([now, io]))
    mainTimeLine =
      tl != null && mainTimeLine != null
        ? timeLine.mappend(ioAppend, mainTimeLine, tl)
        : tl != null
        ? tl
        : mainTimeLine
    console.groupEnd()
    return disposable.rtrn(() => {
      canceled.value = true
    })
  }
}
