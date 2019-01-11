//@flow
import type { IO } from "./io"
import type { O } from "./scheduler"
import { Delay } from "./scheduler"
import type { Disposable } from "./disposable"
export opaque type S<A> = IO<(O) => Disposable, ?A | Error, Disposable>

export const at = <A>(t: number, a: A): S<A> => o => run =>
  run(
    Delay(t)(_ => t => {
      try {
        o(a)
        o()
      } catch (error) {
        if (error instanceof Error) {
          o(error)
        } else {
          o(new Error())
        }
      }
    })
  )

export const run = <A>(
  run: O => Disposable,
  o: (?A | Error) => void,
  s: S<A>
) => s(o)(run)
