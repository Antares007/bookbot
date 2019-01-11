//@flow
import type { IO } from "./io.js"
import type { Disposable } from "./disposable.js"
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
  const ring: (
    IO<number, O, void>
  ) => IO<number, [number, IO<number, O, void>], void> = io => o => now => {
    io(v => {
      switch (v.tag) {
        case "Local":
        case "Origin":
          ring(v.io)(oo)(now)
          break
        case "Delay":
          o([v.delay + now, v.io])
          break
        default:
          throw new Error("never")
      }
    })(now)
  }
  ring(pair[1])(oo)(pair[0])
}

const ioAppend = (l, r) => o => i => {
  l(o)(i)
  r(o)(i)
}
export function mkScheduler<H>(
  tf: () => number,
  requestNextFrame: (() => void) => H
): O => Disposable {
  var now = tf()
  var mainTimeLine = null
  var h: ?H = null
  const onNextFrame = () => {
    now = tf()
    if (mainTimeLine) {
      const bounds = timeLine.getBounds(mainTimeLine)
      if (bounds[1] <= now) {
        var leftIO: IO<
          void,
          [number, IO<number, O, void>],
          void
        > = o => () => {}
        const restTl1 = timeLine.runTo(ioAppend, now, mainTimeLine)(v => {
          const left = leftIO
          leftIO = o => () => {
            left(o)()
            runAllNows(v)(o)()
          }
        })()
        const restTl2 = timeLine.fromIO(ioAppend, leftIO)
        mainTimeLine =
          restTl1 != null && restTl2 != null
            ? timeLine.mappend(ioAppend, restTl1, restTl2)
            : restTl1 != null
            ? restTl1
            : restTl2
      }
    }
    if (mainTimeLine) {
      h = requestNextFrame(onNextFrame)
    } else {
      h = null
    }
  }
  return v => {
    if (h == null) {
      now = tf()
      h = requestNextFrame(onNextFrame)
    }
    const canceled: CancelRef = { value: false }
    const offset = 0 - now
    const io =
      v.tag === "Local"
        ? cancelOffsetRing(canceled, offset, v.io)
        : v.tag === "Origin"
        ? cancelOffsetRing(canceled, 0, v.io)
        : cancelOffsetRing(canceled, offset, o => i => o(Delay(v.delay)(v.io)))
    const tl = timeLine.fromIO(ioAppend, runAllNows([now, io]))
    mainTimeLine =
      tl != null && mainTimeLine != null
        ? timeLine.mappend(ioAppend, mainTimeLine, tl)
        : tl != null
        ? tl
        : mainTimeLine
    return disposable.rtrn(() => {
      canceled.value = true
    })
  }
}
