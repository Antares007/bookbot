// @flow strictlocal
import type { S } from './stream'
import * as s from './stream'

type Sha1 = string
opaque type Blob: Buffer = Buffer
opaque type File: Buffer = Buffer
opaque type Exec: Buffer = Buffer
opaque type Sym: Buffer = Buffer

type PithO2<O1, O2> = ((O1, O2) => void) => void
opaque type O =
  | { type: 'blob', s: S<Buffer> }
  | { type: 'exec', s: S<Buffer> }
  | { type: 'sym', s: S<Buffer> }
  | { type: 'tree', s: S<PithO2<string, O>> }
  | {
      type: 'commit',
      s: S<
        PithO2<
          {
            author: {
              name: string,
              email: string
            },
            message: string
          },
          O
        >
      >
    }

function blob(s: S<Buffer>): O {
  return { type: 'blob', s }
}
function tree(s: S<Buffer>): O {
  return { type: 'blob', s }
}

// function run(jsgit: any, v: O): S<Sha1> {
//   if (v.type === 'blob') {
//     return s.flatMap(buffer => s.empty, v.s)
//   } else if (v.type === 'tree') {
//     return s.flatMap(buffer => s.empty, v.s)
//   }
//   return s.empty
// }

const modes = require('js-git/lib/modes')
// const memdb: () => JsGit = require("js-git/mixins/mem-db.js")
//
const a = 42
