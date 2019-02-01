//@flow strictlocal
import type { S } from "./stream"
import * as s from "./stream"

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
    return s.flatMap(buffer => s.empty, v.s)
  } else if (v.type === "tree") {
    return s.flatMap(buffer => s.empty, v.s)
  }
  return s.empty
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
