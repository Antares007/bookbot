// @flow strict
import * as S from '../../S'
import type { NPith } from '../N'

export function on<I, O>(
  p: NPith<{ ...I, on: S.On, ref: S.S<Node> }, O>
): NPith<I, O> {
  throw new Error()
}
