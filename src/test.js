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

export function* run(
  prefix: string,
  platform: Assert & FS & Require,
  f: string => boolean = name => name.endsWith(".js")
): Iterable<Promise<{ name: string, errors: Array<Error> }>> {
  for (let path of filter(f, ls(prefix, platform))) {
    const exports = platform.require(path)
    for (let name in exports) {
      const rez = /^a([0-9]+)_/.exec(name)
      if (!rez || typeof exports[name] !== "function") continue
      const plan = parseInt(rez[1], 10)
      yield runATest(platform, plan, exports[name]).then(asserts => {
        const errors = asserts.filter(Boolean)
        if (plan !== asserts.length) errors.push(new Error("plan !== asserts"))
        return { name: platform.join(path, name).slice(prefix.length), errors }
      })
    }
  }
}

export function runATest(
  assert: Assert,
  plan: number,
  aTest: Assert => void
): Promise<Array<?Error>> {
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
      return reject(err)
    }
    const t0 = Date.now()
    const rec = () => {
      if (
        (asserts.length === plan && !asserts.some(v => v instanceof Error)) ||
        Date.now() - t0 > 99
      ) {
        resolve(asserts)
      } else {
        setTimeout(rec, 0)
      }
    }
    rec()
  })
}

function* ls(
  path: string,
  fs: {
    +readdirSync: string => Array<string>,
    +statSync: string => { +isDirectory: () => boolean },
    +join: (...Array<string>) => string
  }
): Iterable<string> {
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
