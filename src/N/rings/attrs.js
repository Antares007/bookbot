// @flow strict
import type { NPith } from '../N'

export class Attrs {}
export function attrs<I, O>(p: NPith<I, O | Attrs>): NPith<I, O> {
  throw new Error()
}
