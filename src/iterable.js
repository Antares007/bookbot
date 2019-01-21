export function run<a>(
  o: (?a) => void,
  it: Iterable<Promise<a>>,
  n: number = 4
): void {
  let i = 0
  let p = Promise.resolve()
  let endSent = false
  const req = (n: number) => {
    const taken = [
      ...map(
        p =>
          p.then(a => {
            i--
            req(Math.max(n - i, 0))
            o(a)
          }),
        take(n, it)
      )
    ]
    if (taken.length === 0) {
      if (!endSent) {
        endSent = true
        p = p.then(() => o())
      }
    } else {
      i = i + taken.length
      p = p.then(() => Promise.all(taken))
    }
  }
  req(n)
}

export function* filter<T>(f: T => boolean, xs: Iterable<T>): Iterable<T> {
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
