// @flow strict

export type Right<+T> = {| +T: 'right', +value: T |}
export type Left<+T> = {| +T: 'left', +value: T |}

export const left: <L>(L) => Left<L> = <L>(value: L) => ({ T: 'left', value })
export const right: <R>(R) => Right<R> = <R>(value: R) => ({ T: 'right', value })
export const map = <A, B, L>(f: A => B, lr: Right<A> | Left<L>): Right<B> | Left<L> =>
  lr.T === 'right' ? right(f(lr.value)) : lr
export const flatMap = <A, B, L>(
  f: A => Right<B> | Left<L>,
  lr: Right<A> | Left<L>
): Right<B> | Left<L> => (lr.T === 'right' ? f(lr.value) : lr)
