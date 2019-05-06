// @flow strict
export type Pith<+O, -A, +B> = ((O) => void, A) => B
