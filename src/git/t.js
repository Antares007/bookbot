// @flow strict
import * as OC from './object-codec'
import * as P from '../P'
import * as M from '../M'
import * as fs from 'fs'
import * as zlib from 'zlib'
import { join as pathJoin } from 'path'

export type Hash = string

export const mkrepo: string => { load: Hash => P.PPith<OC.Tree | OC.Blob | OC.Commit> } = M.ab(
  rootPath => {
    return {
      load: M.ab(hash =>
        P.p(o => {
          fs.readFile(hashToPath(hash), (err, buffer) => {
            if (err) {
              if (err.code !== 'ENOENT') o(P.rError(err))
              else {
              }
            } else {
              zlib.inflate(buffer, (err, buffer) => {
                if (err) o(P.rError(err))
                else o(P.rValue(OC.deframe(buffer)))
              })
            }
          })
        })
      )
    }

    function hashToPath(hash) {
      return pathJoin(rootPath, 'objects', hash.substring(0, 2), hash.substring(2))
    }
  }
)
