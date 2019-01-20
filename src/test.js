//@flow
export type Assert = {
  +ok: (value: any, message?: string) => void,
  +strictEqual: (actual: any, expected: any, message?: string) => void,
  +deepStrictEqual: (actual: any, expected: any, message?: string) => void,
  +notStrictEqual: (actual: any, expected: any, message?: string) => void,
  +notDeepStrictEqual: (actual: any, expected: any, message?: string) => void
}

type FS = {
  +readdirSync: string => Array<string>,
  +statSync: string => { +isDirectory: () => boolean },
  +join: (...Array<string>) => string
}

type Require = {
  +require: string => any
}

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
        p = p.then(() => {
          o()
        })
      }
    } else {
      i = i + taken.length
      p = p.then(() => Promise.all(taken))
    }
  }
  req(n)
}

export function* generate(
  prefix: string,
  platform: Assert & FS & Require,
  f: string => boolean = name => name.endsWith(".js")
): Iterable<Promise<{ name: string, errors: Array<Error> }>> {
  for (let path of [...filter(f, ls(prefix, platform))]) {
    try {
      const exports = platform.require(path)
      for (let name in exports) {
        const rez = /^a([0-9]+)_/.exec(name)
        if (!rez || typeof exports[name] !== "function") continue
        const plan = parseInt(rez[1], 10)
        yield runATest(platform, plan, exports[name]).then(errors => {
          return {
            name: platform.join(path, name).slice(prefix.length + 1),
            errors
          }
        })
      }
    } catch (err) {
      yield Promise.resolve({
        name: path.slice(prefix.length + 1),
        errors: [err]
      })
    }
  }
}

export function runATest(
  assert: Assert,
  plan: number,
  aTest: Assert => void
): Promise<Array<Error>> {
  return new Promise((resolve, reject) => {
    const asserts: Array<?Error> = []
    const mkAssertFn = (name: string): any => (...args) => {
      try {
        assert[name](...args)
        asserts.push(null)
      } catch (err) {
        if (err && err.code === "ERR_ASSERTION" && err instanceof Error) {
          asserts.push(err)
        } else {
          reject(err)
        }
      }
    }
    try {
      aTest({
        ok: mkAssertFn("ok"),
        strictEqual: mkAssertFn("strictEqual"),
        deepStrictEqual: mkAssertFn("deepStrictEqual"),
        notStrictEqual: mkAssertFn("notStrictEqual"),
        notDeepStrictEqual: mkAssertFn("notDeepStrictEqual")
      })
    } catch (err) {
      return resolve([err])
    }
    const t0 = Date.now()
    const rec = () => {
      if (
        (asserts.length === plan && !asserts.some(v => v instanceof Error)) ||
        Date.now() - t0 > 99
      ) {
        const errors: Array<Error> = asserts.filter(Boolean)
        if (plan !== asserts.length)
          errors.push(
            new Error(
              `\u001b[32mplan(${plan})\u001b[39m !== \u001b[31masserts(${
                asserts.length
              })\u001b[39m`
            )
          )
        resolve(errors)
      } else {
        setTimeout(rec, 0)
      }
    }
    rec()
  })
}

function* ls(path: string, fs: FS): Iterable<string> {
  if (fs.statSync(path).isDirectory()) {
    for (let name of fs.readdirSync(path))
      for (let x of ls(fs.join(path, name), fs)) yield x
  } else {
    yield path
  }
}

function* filter<T>(f: T => boolean, xs: Iterable<T>): Iterable<T> {
  for (let x of xs) if (f(x)) yield x
}

function* map<a, b>(f: a => b, bs: Iterable<a>): Iterable<b> {
  for (let a of bs) yield f(a)
}

function* take<a>(n: number, xs: Iterable<a>): Iterable<a> {
  if (n <= 0) return
  let i = 0
  for (let x of xs) {
    yield x
    if (++i === n) return
  }
}
