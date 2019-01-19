//@flow
export opaque type List<A>: null | [A, List<A>] = null | [A, List<A>]

export function empty<A>(): List<A> {
  return null
}

export function cons<A>(a: A, l: List<A>): List<A> {
  return [a, l]
}
