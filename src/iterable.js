// @flow strict
export function awaitPromises<a>(
  o: (?a | Error) => void,
  it: Iterable<Promise<a>>
): Promise<void> {
  let i = 0
  return reduce(
    (pv, pa) => pv.then(() => pa.then(o)),
    Promise.resolve(),
    it
  ).then(() => o(null), err => o(err))
}

export function* filter<a>(f: a => boolean, xs: Iterable<a>): Iterable<a> {
  for (let x of xs) if (f(x)) yield x
}

export function* map<a, b>(f: a => b, bs: Iterable<a>): Iterable<b> {
  for (let a of bs) yield f(a)
}

export function* take<a>(n: number, xs: Iterable<a>): Iterable<a> {
  if (n <= 0) return
  let i = 0
  for (let x of xs) {
    yield x
    if (++i === n) return
  }
}

export function reduce<a, b>(f: (b, a) => b, s: b, as: Iterable<a>): b {
  let b_ = s
  for (let a of as) b_ = f(b_, a)
  return b_
}
