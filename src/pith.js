// @flow strict

export type Pith<+O, -A, +B> = ((O) => void, A) => B

export type Bark<-O, +A, -B, +C> = (pith: Pith<O, A, B>) => C

import * as D from './S/Disposable'

type Nxt<+A> = { +T: 'nxt', +a: A }
type End = { +T: 'end' }
type Exn = { +T: 'exn', exn: Error }

type SPith<+A> = Pith<Nxt<A> | End | Exn, void, D.Disposable>

function s<+A>(f: Pith<Nxt<A> | End | Exn, void, D.Disposable>): SPith<A> {
  throw new Error()
}

const see = s(o => {
  o({ T: 'nxt', a: 1 })
  o({ T: 'end' })
  o({ T: 'exn', exn: new Error() })
  return D.create(() => {})
})

see(e => {
  if (e.T === 'nxt') {
    e
  } else if (e.T === 'end') {
    e
  } else {
    e
  }
})

function test<A>(): SPith<A> {
  return s(o => {
    return D.create(() => {})
  })
}
