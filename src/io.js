// @flow
export type IO<A, O, B> = ((O) => void) => A => B

export function omap<A, O, B, R>(f: O => R): (IO<A, O, B>) => IO<A, R, B> {
  return io => o => i => io(a => o(f(a)))(i)
}
