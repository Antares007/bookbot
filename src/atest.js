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
): Iterable<Promise<{ name: string, time: number, errors: Array<Error> }>> {
  for (let path of [...filter(f, ls(prefix, platform))]) {
    try {
      const exports = platform.require(path)
      for (let name in exports) {
        if (
          typeof exports[name] !== "function" ||
          !exports[name].toString().includes(`(assert)`)
        )
          continue
        let t0 = Date.now()
        yield runATest(platform, exports[name], timeout).then(errors => {
          return {
            name: platform.join(path, name).slice(prefix.length + 1),
            time: Date.now() - t0,
            errors
          }
        })
      }
    } catch (err) {
      yield Promise.resolve({
        name: path.slice(prefix.length + 1),
        time: 0,
        errors: [err]
      })
    }
  }
}

function runATest(
  assert: A,
  aTest: (f: A & Test) => void,
  timeout: number
): Promise<Array<Error>> {
  return new Promise((resolve, reject) => {
    try {
      let plan: number = 1
      let asserts: number = 0
      let timeoutId
      const errors: Array<Error> = []

      const mkAssertFn = (name): any =>
        function aRing(...args) {
          asserts++
          assert[name].apply(this, args)
          if (asserts === plan) {
            clearTimeout(timeoutId)
            resolve(errors)
          }
        }
      const f: any = f => {
        plan++
        return function ring(...args: Array<any>) {
          try {
            f.apply(this, args)
          } catch (err) {
            errors.push(err)
          }
        }
      }
      f.ok = mkAssertFn("ok")
      f.strictEqual = mkAssertFn("strictEqual")
      f.deepStrictEqual = mkAssertFn("deepStrictEqual")
      f.notStrictEqual = mkAssertFn("notStrictEqual")
      f.notDeepStrictEqual = mkAssertFn("notDeepStrictEqual")

      aTest(f)

      if (asserts === plan) return resolve(errors)
      timeoutId = setTimeout(() => {
        errors.push(
          new Error(
            `timeout ${timeout}ms \u001b[32mplan(${plan})\u001b[39m !== \u001b[31masserts(${asserts})\u001b[39m`
          )
        )
        resolve(errors)
      }, timeout)
    } catch (err) {
      resolve([err])
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