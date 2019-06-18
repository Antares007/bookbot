// @flow strict

export function ab<A, B>(f: A => B): A => B {
  const map = new Map()
  if (f.toString() === Mfab.toString()) return f
  return Mfab
  function Mfab(a) {
    var b = map.get(a)
    if (typeof b !== 'undefined') return b
    map.set(a, (b = f(a)))
    return b
  }
}
export function abc<A, B, C>(f: A => B => C): A => B => C {
  const map = new Map()
  return function Mabc(a) {
    var fab = map.get(a)
    if (typeof fab !== 'undefined') return fab
    fab = ab(f(a))
    map.set(a, fab)
    return fab
  }
}
export function abcd<A, B, C, D>(f: A => B => C => D): A => B => C => D {
  const map = new Map()
  return function Mabcd(a) {
    var fabc = map.get(a)
    if (typeof fabc !== 'undefined') return fabc
    fabc = abc(f(a))
    map.set(a, fabc)
    return fabc
  }
}

export function m<A, B>(f: A => B): A => B {
  const map = new Map()
  // ???
  if (f.toString() === M.toString()) return f
  return M
  function M(a) {
    var b = map.get(a)
    if (typeof b !== 'undefined') return b
    map.set(a, (b = f(a)))
    return b
  }
}

export function m2<A, B, C>(f: (A, B) => C): (A, B) => C {
  const map = new Map()
  return function M2(a, b) {
    var fb = map.get(a)
    if (typeof fb !== 'undefined') return fb(b)
    fb = m(b => f(a, b))
    map.set(a, fb)
    return fb(b)
  }
}

export function m3<A, B, C, D>(f: (A, B, C) => D): (A, B, C) => D {
  const map = new Map()
  return function M3(a, b, c) {
    var fbc = map.get(a)
    if (typeof fbc !== 'undefined') return fbc(b, c)
    fbc = m2((b, c) => f(a, b, c))
    map.set(a, fbc)
    return fbc(b, c)
  }
}
