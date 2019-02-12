//@flow strict
import type { A } from '../src/atest'
import { awaitPromises } from '../src/iterable'
import { run } from '../src/atest'
import * as path from 'path'

const fail = '\u001b[31mfail\u001b[39m'
const pass = '\u001b[32mpass\u001b[39m'

const rez = [0, 0]
awaitPromises(
  v => {
    if (v == null) {
      console.log(pass, rez[0])
      console.log(fail, rez[1])
    } else if (v instanceof Error) {
      throw v
    } else {
      const e = v.error
      if (e != null) {
        rez[1]++
        console.log()
        console.group(`${v.name}(${v.time})`, fail)
        console.log(e.message)
        console.log(
          e.stack
            .split(/\n/gi)
            .filter(l => l.includes(path.join(__dirname, '..')))
            .map(l =>
              l
                .trim()
                .split(path.join(__dirname, '..') + '/')
                .join('./')
            )
            .join('\n')
        )
        console.groupEnd()
        console.log()
      } else {
        rez[0]++
        process.stdout.write('.')
      }
    }
  },
  run(
    __dirname,
    {
      ...require('fs'),
      ...require('assert'),
      ...path,
      require: s => require.call(module, s)
    }
    //n => n.includes('schedu')
  )
)
