//@flow
import type { IO } from "./io.js"
import type { Disposable } from "./disposable.js"
import * as disposable from "./disposable.js"
import * as timeLine from "./timeline.js"

export opaque type O =
  | { tag: "Local", io: IO<number, O, void> }
  | { tag: "Origin", io: IO<number, O, void> }
  | { tag: "Delay", delay: number, io: IO<number, O, void> }

export function Local(io: IO<number, O, void>): O {
  return { tag: "Local", io }
}
export function Origin(io: IO<number, O, void>): O {
  return { tag: "Origin", io }
}
export function Delay(delay: number): (IO<number, O, void>) => O {
  return io => ({ tag: "Origin", delay, io })
}

type CancelRef = { value: boolean }

function ring(
  cref: CancelRef,
  offset: number
): (IO<number, O, void>) => IO<number, O, void> {
  return io => o => now => {
    if (cref.value) return
    io(r => {
      if (r.tag === "Local") o(Local(ring(cref, 0 - now)(r.io)))
      else if (r.tag === "Origin") o(Origin(ring(cref, 0)(r.io)))
      else if (r.tag === "Delay") o(Delay(r.delay)(ring(cref, offset)(r.io)))
      else throw new Error("never")
    })(now + offset)
  }
}

function runAllNows(
  now: number
): (IO<number, O, void>) => IO<void, [number, IO<number, O, void>], void> {
  return io => oo => () => {
    const ring: (
      IO<number, O, void>
    ) => IO<number, [number, IO<number, O, void>], void> = io => o => i => {
      io(r => {
        if (r.tag === "Local" || r.tag === "Origin") {
          ring(r.io)(oo)(now)
        } else if (r.tag === "Delay") {
          o([r.delay + now, io])
        } else throw new Error("never")
      })(i)
    }
    ring(io)(oo)(now)
  }
}
const tlappend = (l, r) => o => i => {
  l(o)(i)
  r(o)(i)
}
export function mkScheduler(
  tf: () => number,
  requestNextFrame: (() => void) => void
): O => Disposable {
  var now = tf()
  var mainTimeLine = null
  const onNextFrame = () => {
    now = tf()
    if (mainTimeLine != null) {
      const bounds = timeLine.getBounds(mainTimeLine)
      if (bounds[1] <= now) {
        const run = runAllNows(now)
        var restIO: IO<
          void,
          [number, IO<number, O, void>],
          void
        > = o => () => {}
        const restTl1 = timeLine.runTo(tlappend, now, mainTimeLine)(r => {
          restIO = o => () => {
            const left = restIO
            const right = run(r[1])
            left(o)()
            right(o)()
          }
        })()
        const restTl2 = timeLine.fromIO(tlappend, restIO)
        mainTimeLine =
          restTl1 != null && restTl2 != null
            ? timeLine.mappend(tlappend, restTl1, restTl2)
            : restTl1 != null
            ? restTl1
            : restTl2
      }
    }
    requestNextFrame(onNextFrame)
  }
  requestNextFrame(onNextFrame)
  return r => {
    const cancelRef: CancelRef = { value: false }
    const offset = 0 - now
    const io =
      r.tag === "Local"
        ? ring(cancelRef, offset)(r.io)
        : r.tag === "Origin"
        ? ring(cancelRef, 0)(r.io)
        : ring(cancelRef, offset)(o => i => {
            o(Delay(r.delay)(r.io))
          })
    const tl = timeLine.fromIO(tlappend, runAllNows(now)(io))
    mainTimeLine =
      tl != null && mainTimeLine != null
        ? timeLine.mappend(tlappend, mainTimeLine, tl)
        : tl != null
        ? tl
        : mainTimeLine
    return disposable.rtrn(() => {
      cancelRef.value = true
    })
  }
}
