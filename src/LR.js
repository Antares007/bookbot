// @flow strict

export type T<+L, +R> = Left<L> | Right<R>

export type Left<+L> = {| +T: 'left', +value: L |}
export const left = <L>(value: L): Left<L> => ({ T: 'left', value })

export type Right<+R> = {| +T: 'right', +value: R |}
export const right = <R>(value: R): Right<R> => ({ T: 'right', value })

export const map = <L, Ra, Rb>(f: Ra => Rb, r: T<L, Ra>): T<L | Error, Rb> => {
  if (r.T === 'right')
    try {
      return right(f(r.value))
    } catch (err) {
      return left(err instanceof Error ? err : new Error(err))
    }
  else return r
}

export const join = <La, Lb, R>(r: T<La, T<Lb, R>>): T<La | Lb, R> =>
  r.T === 'right' ? r.value : r

export const flatMap = <La, Lb, Ra, Rb>(f: Ra => T<Lb, Rb>, r: T<La, Ra>): T<La | Lb | Error, Rb> =>
  join(map(f, r))

export const filter = <L, Ra>(f: Ra => boolean, r: T<L, Ra>): T<void | L | Error, Ra> =>
  flatMap(v => (f(v) ? r : left()), r)
