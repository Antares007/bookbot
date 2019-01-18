import type { T } from "./test.js"
import type { IO } from "./io.js"
import { Ring, run, Test } from "./test.js"
import { statSync, readdirSync } from "fs"
import { join, basename, extname } from "path"

const _require = require
const dirmap: { [string]: boolean } = {}
const isdir = (path: string) => {
  if (dirmap[path]) return true
  dirmap[path] = statSync(path).isDirectory()
  return dirmap[path]
}
const isTlike = (path: string) => extname(path) === ".js" || isdir(path)
const isT = (e: any): boolean => {
  if (e == null) return false
  return (
    (e.tag === "Test" &&
      typeof e.name === "string" &&
      typeof e.f === "function") ||
    (e.tag === "Ring" &&
      typeof e.name === "string" &&
      typeof e.io === "function")
  )
}

function fs2io(path: string): IO<void, T, void> {
  if (isdir(path)) {
    const entries = readdirSync(path)
    return o => () => {
      for (var i = 0, l = entries.length; i < l; i++)
        if (isTlike) o(Ring(entries[i], fs2io(join(path, entries[i]))))
    }
  } else {
    return o => () => {
      const e = _require(path).default
      if (isT(e)) o(e)
    }
  }
}

const p = join(__dirname, "..", process.argv[3])
if (!isTlike(p)) throw new Error(`path [${p}] is not T like`)
const rez = run(Ring(basename(p), fs2io(p)))
console.log(rez)
if (rez[1] > 0) process.exitCode = 1
