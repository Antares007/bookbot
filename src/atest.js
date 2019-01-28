//@flow strict
import { map, take, filter } from "./iterable.js"

export type A = {
  +ok: <A>(value: A, message?: string) => void,
  +strictEqual: <A, B>(actual: A, expected: B, message?: string) => void,
  +deepStrictEqual: <A, B>(actual: A, expected: B, message?: string) => void,
  +notStrictEqual: <A, B>(actual: A, expected: B, message?: string) => void,
  +notDeepStrictEqual: <A, B>(actual: A, expected: B, message?: string) => void
}

type FS = {
  +readdirSync: string => Array<string>,
  +statSync: string => { +isDirectory: () => boolean },
  +join: (...Array<string>) => string
}

type Require = {
  +require: string => { [string]: ?(Array<A>) => void }
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
        const src: string = export_.toString()
        const plan = src
          .split(/assert\[/)
          .map(line => /^([0-9]+)]\./.exec(line))
          .filter(Boolean)
          .reduce((a, rez) => Math.max(parseInt(rez[1], 10), a), -1)
        if (plan === -1) continue
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
  aTest: (f: Array<A>) => void
): [() => void, Promise<?Error>] {
  let resolve_ = null
  return [
    () => {
      if (resolve_) resolve_()
    },
    new Promise((resolve, reject) => {
      let i: number = 0
      resolve_ = () => {
        resolve(
          new Error(
            `timeout! \u001b[32mplan(${plan})\u001b[39m !== \u001b[31masserts(${i})\u001b[39m`
          )
        )
      }
      const mkAssertFn = (name: string, index: number) => (...args) => {
        try {
          assert.strictEqual(i, index, `assert i:${i} != index:${index}`)
          assert[name].apply(this, args)
          if (i++ === plan) {
            resolve_ = null
            resolve()
          }
        } catch (err) {
          resolve_ = null
          resolve(err)
        }
      }
      const asserts = new Array(plan)
      for (let i = 0; i <= plan; i++)
        asserts[i] = {
          ok: mkAssertFn("ok", i),
          strictEqual: mkAssertFn("strictEqual", i),
          deepStrictEqual: mkAssertFn("deepStrictEqual", i),
          notStrictEqual: mkAssertFn("notStrictEqual", i),
          notDeepStrictEqual: mkAssertFn("notDeepStrictEqual", i)
        }
      try {
        aTest(asserts)
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
