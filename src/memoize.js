// @flow strict

export function memoize<A, B>(f: A => B): A => B {
  const map = new Map()
  return function memoized(a) {
    var b = map.get(a)
    if (b) return b
    map.set(a, (b = f(a)))
    return b
  }
}

export function memoize2<A, B, C>(f: (A, B) => C): (A, B) => C {
  const map = new Map()
  return function memoized2(a, b) {
    var fb = map.get(a)
    if (fb) return fb(b)
    fb = memoize(b => f(a, b))
    map.set(a, fb)
    return fb(b)
  }
}

export function memoize3<A, B, C, D>(f: (A, B, C) => D): (A, B, C) => D {
  const map = new Map()
  return function memoized3(a, b, c) {
    var fbc = map.get(a)
    if (fbc) return fbc(b, c)
    fbc = memoize2((b, c) => f(a, b, c))
    map.set(a, fbc)
    return fbc(b, c)
  }
}
