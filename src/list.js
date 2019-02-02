//@flow strict
export type List<A> = null | [A, List<A>]

export function cons<A>(head: A, tail: List<A>): List<A> {
  return [head, tail]
}
