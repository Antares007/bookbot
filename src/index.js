// @flow
import type { IO } from './io'

type Success = { success: true, value: boolean }
type Failed = { success: false, error: string }

type Response =
  | { success: true, value: boolean }
  | { success: false, error: string }

function handleResponse(response: Response) {
  if (response.success) {
    var value: boolean = response.value // Works!
  } else {
    var error: string = response.error // Works!
  }
}

let a: (o: (v: string) => void) => (i: number) => boolean = o => i => {
  o(i + 1 + '')
  return true
}
a(v => console.log(v))(1)
const see: IO<
  number,
  { tag: 'a' } | { tag: 'b' } | { tag: 'c' },
  void
> = o => i => {}
