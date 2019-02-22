// flow strict

export type stream$O<A> =
  | { type: 'event', t: TimePoint, v: A }
  | { type: 'end', t: TimePoint }
  | { type: 'error', t: TimePoint, v: Error }

type SFn<A> = ((stream$O<A>) => void, Scheduler) => Disposable

export function event<A>(t: TimePoint, v: A): stream$O<A> {
  return { type: 'event', t, v }
}
export function end<A>(t: TimePoint): stream$O<A> {
  return { type: 'end', t }
}
export function error<A>(t: TimePoint, v: Error): stream$O<A> {
  return { type: 'error', t, v }
}
