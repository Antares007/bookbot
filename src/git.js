//@flow strictlocal
import type { S } from "./stream"
import { flatMap, empty } from "./stream"

type Sha1 = string
opaque type Blob: Buffer = Buffer
opaque type File: Buffer = Buffer
opaque type Exec: Buffer = Buffer
opaque type Sym: Buffer = Buffer

opaque type O =
  | { type: "blob", s: S<Buffer> }
  | { type: "exec", s: S<Buffer> }
  | { type: "sym", s: S<Buffer> }
  | { type: "tree", s: S<((name: string, O) => void) => void> }
  | {
      type: "commit",
      s: S<
        (
          (
            {
              author: {
                name: string,
                email: string
              },
              message: string
            },
            O
          ) => void
        ) => void
      >
    }

function run(jsgit: any, v: O): S<Sha1> {
  if (v.type === "blob") {
    return flatMap(
      buffer => (o, schedule) => {
        let active = true
        const d = {
          dispose: () => {
            active = false
          }
        }
        schedule(t0 => {
          jsgit.saveAs(
            v.type === "commit" || v.type === "tree" ? v.type : "blob",
            buffer,
            (err, hash) =>
              schedule(t => {
                if (err && active) return o.error(t - t0, err)
                try {
                  if (active) o.event(t - t0, hash)
                  if (active) o.end(t - t0)
                } catch (err) {
                  o.error(t - t0, err)
                }
              })
          )
        })
        return d
      },
      v.s
    )
  } else if (v.type === "tree") {
    return flatMap(
      buffer => (o, schedule) => {
        let active = true
        const d = {
          dispose: () => {
            active = false
          }
        }
        schedule(t0 => {
          jsgit.saveAs(
            v.type === "commit" || v.type === "tree" ? v.type : "blob",
            buffer,
            (err, hash) =>
              schedule(t => {
                if (err && active) return o.error(t - t0, err)
                try {
                  if (active) o.event(t - t0, hash)
                  if (active) o.end(t - t0)
                } catch (err) {
                  o.error(t - t0, err)
                }
              })
          )
        })
        return d
      },
      v.s
    )
  }

  return empty()
}

//+blob: (name: string, S<Buffer>) => void,
//+exec: (name: string, S<Buffer>) => void,
//+sym: (name: string, S<Buffer>) => void,
//+tree: (name: string, S<((O) => void) => void>) => void,
//+commit: (
//  name: string,

//) => void
//}

//tree:  commit:
//type Tree = { [string]: { mode: number, hash: Sha1 } }

const modes = require("js-git/lib/modes")
// const memdb: () => JsGit = require("js-git/mixins/mem-db.js")
//
const a = 42
