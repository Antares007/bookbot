//@flow strict
import type { A } from '../src/atest'
import { run } from '../src/atest'
import { join } from 'path'

const tests = ['scheduler.js', 'stream.js']
run(({ fullname, error }) => {
  if (!error) process.stdout.write('.')
  else {
    console.group(fullname.slice(__dirname.length))
    console.log(error)
    console.groupEnd()
  }
}, tests.map(a => join(__dirname, a)))
