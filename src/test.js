//@flow

export type ATest = Assert => void

type Assert = {
  +ok: (value: any, message?: string) => void,
  +strictEqual: (value: any, message?: string) => void,
  +deepStrictEqual: (actual: any, expected: any, message?: string) => void,
  +notStrictEqual: (actual: any, expected: any, message?: string) => void,
  +notDeepStrictEqual: (actual: any, expected: any, message?: string) => void
}

export function makeRun(
  assert: Assert
): (plan: number, aTest: ATest) => Promise<Array<?Error>> {
  return (plan, aTest) => {
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
}

function* ls(
  path: string,
  fs: {
    +readdirSync: string => Array<string>,
    +statSync: string => { +isDirectory: () => boolean },
    +join: (...Array<string>) => string
  }
): Generator<string, void, void> {
  if (fs.statSync(path).isDirectory()) {
    for (let name of fs.readdirSync(path))
      for (let x of ls(fs.join(path, name), fs)) yield x
  } else {
    yield path
  }
}
