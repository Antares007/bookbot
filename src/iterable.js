//@flow
export function awaitPromises<a>(
  o: (?a | Error) => void,
  it: Iterable<Promise<a>>,
  n: number = 4
): void {
  let i = 0
  let p = Promise.resolve()
  let endAttached = false
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
      if (!endAttached) {
        endAttached = true
        p = p.then(() => o(), err => o(err))
      }
    } else {
      i = i + taken.length
      p = p.then(() => Promise.all(taken))
    }
  }
  req(n)
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
