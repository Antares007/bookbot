// @flow strict
import { parse } from './parse'
import { readFileSync } from 'fs'
import { join } from 'path'

export type A = {
  +ok: <A>(value: A, message?: string) => void,
  +strictEqual: <A, B>(actual: A, expected: B, message?: string) => void,
  +deepStrictEqual: <A, B>(actual: A, expected: B, message?: string) => void,
  +notStrictEqual: <A, B>(actual: A, expected: B, message?: string) => void,
  +notDeepStrictEqual: <A, B>(actual: A, expected: B, message?: string) => void
}
const assert = require.call(module, 'assert').strict

export function run(
  o: ({ fullname: string, error?: Error }) => void,
  filePaths: Iterable<string>
): void {
  for (let filePath of filePaths) {
    try {
      const testDeclarations = parse(readFileSync(filePath, 'utf8'))
      if (testDeclarations.length === 0) continue
      const exports = require.call(module, filePath)
      let timeoutID
      let totalPlan = 0
      const plan: { [string]: number } = testDeclarations.reduce((a, d) => {
        const fullname = join(filePath, d.name)
        a[fullname] = d.plan
        totalPlan += d.plan
        runTest(error => {
          if (error != null) o({ fullname, error })
          else {
            if (--a[fullname] === 0) o({ fullname })
            if (--totalPlan === 0) clearTimeout(timeoutID)
          }
        }, exports[d.name])
        return a
      }, {})
      timeoutID = setTimeout(() => {
        for (let name in plan)
          if (plan[name] !== 0)
            o({ fullname: name, error: new Error('timeout') })
      }, 1000)
    } catch (error) {
      o({ fullname: filePath, error })
    }
  }
}

function runTest(o: (?Error) => void, f): void {
  var i = 0
  try {
    const p = f.call(
      {},
      new Proxy([], {
        get(_, property) {
          const index = parseInt(property, 10)
          if (isNaN(index)) return Reflect.get(...arguments)
          return new Proxy(assert, {
            get(_, property) {
              return (...args) => {
                try {
                  i++
                  assert[property](...args)
                  if (i - 1 === index) o()
                  else o(new Error(`index actual(${i}) === expected(${index})`))
                } catch (err) {
                  o(new Error(`assert[${index}].${property}:\n${err.message}`))
                }
              }
            }
          })
        }
      })
    )
    if (p instanceof Promise) p.catch(o)
  } catch (err) {
    o(err)
  }
}
