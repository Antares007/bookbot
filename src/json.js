//@flow strictlocal
import type { S } from './stream'
import * as s from './stream'

opaque type O =
  | { type: 'string', s: S<string> }
  | { type: 'number', s: S<number> }
  | { type: 'boolean', s: S<boolean> }
  | { type: 'object', key: string, s: S<((O) => void) => void> }
  | { type: 'array', index: number, s: S<((O) => void) => void> }

export function run(v: O): S<number> {
  return s.empty
}

declare var o: O => void

o({
  type: 'string',
  s: (o, schedule) => {
    s.emptyDisposable
  }
})

const v = {
  name: '',
  age: 1,
  sex: false
}
type Props = typeof v

// The following two types are equivalent:
type PropValues = string | number | boolean
type Prop$Values = $Values<Props>
const see: PropValues = v.name

const name: Prop$Values = 'Jon' // OK
const age: Prop$Values = 42 // OK
