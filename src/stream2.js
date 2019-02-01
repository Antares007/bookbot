//@flow strict
import type { Scheduler } from "./scheduler.js"

export type O<A> =
  | { type: "event", t: number, v: A }
  | { type: "end", t: number }
  | { type: "error", t: number, v: Error }

function event<A>(t: number, v: A): O<A> {
  return { type: "event", t, v }
}
function end<A>(t: number): O<A> {
  return { type: "end", t }
}
function error<A>(t: number, v: Error): O<A> {
  return { type: "error", t, v }
}

export type S<A> = ((O<A>) => void, Scheduler) => D

export type D = { +dispose: () => void }

const emptyDisposable: D = { dispose: () => {} }

export const empty = () => emptyDisposable

export function at<A>(a: A, delay: number): S<A> {
  return (sink_, scheduler) => {
    const ref = aRef()
    const sink = trySink(aSink(ref, sink_))
    scheduler(delay, _ => (sink(event(delay, a)), sink(end(delay))))
    return aDisposable(ref)
  }
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return (sink, scheduler) =>
    s(v => (v.type === "event" ? sink(event(v.t, f(v.v))) : sink(v)), scheduler)
}

export function merge<A>(...lr: Array<S<A>>): S<A> {
  return (sink_, schedule) => {
    const m: Map<number, D> = new Map()
    const ref = aRef()
    const sink = aSink(ref, sink_)
    for (var i = 0, l = lr.length; i < l; i++) {
      m.set(i, lr[i](indexSink(i, m, sink), schedule))
    }
    return aDisposable(ref, () => m.forEach(d => d.dispose()))
  }
}

function indexSink<A>(
  index: number,
  dmap: Map<number, D>,
  o: (O<A>) => void
): (O<A>) => void {
  return v => {
    if (v.type === "event") {
      o(v)
    } else if (v.type === "end") {
      dmap.delete(index)
      if (dmap.size !== 0) return
      o(v)
    } else {
      dmap.forEach(d => d.dispose)
      o(v)
    }
  }
}

function aSink<A>(ref: { active: boolean }, o: (O<A>) => void): (O<A>) => void {
  return v => {
    if (!ref.active) return
    if (v.type === "event") return o(v)
    ref.active = false
    o(v)
  }
}

function trySink<A>(o: (O<A>) => void): (O<A>) => void {
  return v => {
    if (v.type === "error") return o(v)
    try {
      o(v)
    } catch (err) {
      o(error(v.t, err))
    }
  }
}

function aRef() {
  return { active: true }
}

function aDisposable(ref: { active: boolean }, f?: () => void): D {
  return {
    dispose() {
      if (!ref.active) return
      ref.active = false
      if (f) f.dispose()
    }
  }
}
