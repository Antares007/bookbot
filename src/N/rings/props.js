// @flow strict
import type { NPith } from '../N'

class Props {}
export function props<I, O>(p: NPith<I, O | Props>): NPith<I, O> {
  throw new Error()
}
