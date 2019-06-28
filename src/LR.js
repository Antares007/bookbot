// @flow strict

export type T<+L, +R> = Left<L> | Right<R>

export type Left<+L> = {| +T: 'left', +value: L |}
export const left = <L>(value: L): Left<L> => ({ T: 'left', value })

export type Right<+R> = {| +T: 'right', +value: R |}
export const right = <R>(value: R): Right<R> => ({ T: 'right', value })

export const map = <A, B, L>(f: A => B, lr: T<L, A>): T<L, B> =>
  lr.T === 'right' ? right(f(lr.value)) : lr

export const reduce = <A, B, L>(f: (B, A) => B, b: B, r: T<L, A>): T<L, B> =>
  r.T === 'right' ? right(f(b, r.value)) : r

export const filter = <A, L>(f: A => boolean, r: T<L, A>): T<L | void, A> =>
  r.T === 'right' ? (f(r.value) ? r : left()) : r

export const flatMap = <A, B, L>(f: A => Right<B> | Left<L>, lr: T<L, A>): T<L, B> =>
  lr.T === 'right' ? f(lr.value) : lr
