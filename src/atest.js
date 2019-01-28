//@flow
import { map, take, filter } from "./iterable.js"

export type A = {
  +ok: (value: any, message?: string) => void,
  +strictEqual: (actual: any, expected: any, message?: string) => void,
  +deepStrictEqual: (actual: any, expected: any, message?: string) => void,
  +notStrictEqual: (actual: any, expected: any, message?: string) => void,
  +notDeepStrictEqual: (actual: any, expected: any, message?: string) => void
}

export type Test = <a, b, c, d>((a, b, c, d) => void) => (a, b, c, d) => void

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
  platform: A & FS & Require,
  f: string => boolean = name => name.endsWith(".js"),
  timeout: number = 1000
): Iterable<Promise<{ name: string, time: number, error: ?Error }>> {
  for (let path of [...filter(f, ls(prefix, platform))]) {
    try {
      const exports = platform.require(path)
      for (let name in exports) {
        const r = /^function .+\(assert([0-9]*)\)/
        const export_ = exports[name]
        if (typeof export_ !== "function") continue
        const src = export_.toString()
        const rez = r.exec(src)
        if (rez == null) continue
        const plan = rez[1] === "" ? 1 : parseInt(rez[1], 10)
        let t0 = Date.now()
        console.log(plan)
        yield runATest(platform, plan, export_, timeout).then(error => {
          return {
            name: platform.join(path, name).slice(prefix.length + 1),
            time: Date.now() - t0,
            error
          }
        })
      }
    } catch (err) {
      yield Promise.resolve({
        name: path.slice(prefix.length + 1),
        time: 0,
        error: err
      })
    }
  }
}

function runATest(
  assert: A,
  plan: number,
  aTest: (f: A) => void,
  timeout: number
): Promise<?Error> {
  return new Promise((resolve, reject) => {
    let asserts: number = 0
    const timeoutId = setTimeout(() => {
      resolve(
        new Error(
          `timeout ${timeout}ms \u001b[32mplan(${plan})\u001b[39m !== \u001b[31masserts(${asserts})\u001b[39m`
        )
      )
    }, timeout)
    const mkAssertFn = (name): any => (...args) => {
      try {
        asserts++
        assert[name].apply(this, args)
        if (asserts === plan) {
          clearTimeout(timeoutId)
          resolve()
        }
      } catch (err) {
        clearTimeout(timeoutId)
        resolve(err)
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
      clearTimeout(timeoutId)
      resolve(err)
    }
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
