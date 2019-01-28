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
  const resolveFns = []
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
        const pair = runATest(platform, plan, export_)
        resolveFns.push(pair[0])
        yield pair[1].then(error => {
          resolveFns.splice(resolveFns.indexOf(pair[0]), 1)
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
  setTimeout(() => resolveFns.forEach(f => f()), 1000)
}

function runATest(
  assert: A,
  plan: number,
  aTest: (f: A) => void
): [() => void, Promise<?Error>] {
  let resolve_ = null
  return [
    () => {
      if (resolve_) resolve_()
    },
    new Promise((resolve, reject) => {
      let asserts: number = 0
      resolve_ = () => {
        resolve(
          new Error(
            `timeout! \u001b[32mplan(${plan})\u001b[39m !== \u001b[31masserts(${asserts})\u001b[39m`
          )
        )
      }
      const mkAssertFn = (name): any => (...args) => {
        try {
          asserts++
          assert[name].apply(this, args)
          if (asserts === plan) {
            resolve_ = null
            resolve()
          }
        } catch (err) {
          resolve_ = null
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
        resolve_ = null
        resolve(err)
      }
    })
  ]
}

function* ls(path: string, fs: FS): Iterable<string> {
  if (fs.statSync(path).isDirectory()) {
    for (let name of fs.readdirSync(path))
      for (let x of ls(fs.join(path, name), fs)) yield x
  } else {
    yield path
  }
}
