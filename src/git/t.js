// flow strict
import * as OC from './object-codec'
import * as S from '../S'
import * as M from '../M'
import * as LR from '../LR'
import * as fs from 'fs'
import * as zlib from 'zlib'
import { join as pathJoin } from 'path'

export type Hash = string

const deframe = S.map(OC.deframe)
const inflate = S.flatMap(buffer =>
  S.fromCB(cb => zlib.inflate(buffer, (err: ?Error, buffer: Buffer) => cb(err, buffer)))
)

export const loadHash = (rootPath: string) => (hash: string) =>
  deframe(
    inflate(
      S.tryCatch(
        S.fromCB(cb =>
          fs.readFile(pathJoin(rootPath, 'objects', hash.substring(0, 2), hash.substring(2)), cb)
        )
      )
    )
  )

const see = S.fromCB(cb => fs.readdir('', cb))

//export const mkrepo: string => { load: Hash => CB.CBPith<OC.Tree | OC.Blob | OC.Commit> } = M.ab(
//  rootPath => {
//    return {
//      load: M.ab(hash =>
//        CB.p(o => {
//          fs.readFile(hashToPath(hash), (err, buffer) => {
//            if (err) {
//              if (err.code !== 'ENOENT') o(LR.left(err))
//              else {
//              }
//            } else {
//              zlib.inflate(buffer, (err, buffer) => {
//                if (err) o(LR.left(err))
//                else o(LR.right(OC.deframe(buffer)))
//              })
//            }
//          })
//        })
//      )
//    }
//
//    function hashToPath(hash) {
//      return pathJoin(rootPath, 'objects', hash.substring(0, 2), hash.substring(2))
//    }
//  }
//)
