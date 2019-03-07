//@flow strict
import type { A } from '../src/atest'
import { run } from '../src/atest'
import { join } from 'path'

const tests = ['scheduler.js']
run(({ fullname, error }) => {
  if (!error) process.stdout.write('.')
  else {
    console.log(fullname.slice(__dirname.length))
    console.log(error.message)
  }
}, tests.map(a => join(__dirname, a)))
