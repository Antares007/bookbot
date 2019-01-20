//@flow
import type { IO } from "./io.js"
import * as fs from "fs"
import * as path from "path"
import { Readable } from "stream"

drain(
  tap(
    n => console.log(n),
    take(
      25,
      ls(path.join(__dirname, ".."), { ...require("fs"), ...require("path") })
    )
  )
)

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

const r = new Readable({
  read() {
    //
  }
})

function drain<T>(xs: Iterable<T>): void {
  for (let x of xs) {
  }
}

function* tap<T>(f: T => void, xs: Iterable<T>): Iterable<T> {
  for (let x of xs) {
    f(x)
    yield x
  }
}

function* take<T>(n: number, xs: Iterable<T>): Iterable<T> {
  if (n <= 0) return
  let i = 0
  for (let x of xs) {
    yield x
    if (++i === n) return
  }
}
