// @flow strict
import * as Schdlr from './S/scheduler'
import * as D from './S/Disposable'

export opaque type PPith<+A> = (
  ({ R: 'next', +value: A } | { R: 'error', error: Error }) => void
) => D.Disposable

export function p<+A>(
  pith: (({ R: 'next', +value: A } | { R: 'error', error: Error }) => void) => void
) {}
