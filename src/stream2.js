//@flow strict
import type { Scheduler } from "./scheduler.js"

export type O<A> =
  | { type: "event", t: number, v: A }
  | { type: "end", t: number }
  | { type: "error", t: number, v: Error }

export function event<A>(t: number, v: A): O<A> {
  return { type: "event", t, v }
}
export function end<A>(t: number): O<A> {
  return { type: "end", t }
}
export function error<A>(t: number, v: Error): O<A> {
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

export function throwError<A>(err: Error): S<A> {
  return (sink_, scheduler) => {
    const ref = aRef()
    const sink = aSink(ref, sink_)
    scheduler(0, _ => sink(error(0, err)))
    return aDisposable(ref)
  }
}

export function fromArray<A>(as: Array<A>): S<A> {
  return (sink_, scheduler) => {
    const ref = aRef()
    const sink = trySink(aSink(ref, sink_))
    scheduler(0, _ => {
      for (var i = 0, l = as.length; i < l && ref.active; i++)
        sink(event(0, as[i]))
      sink(end(0))
    })
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

export function flatMap<A, B>(f: A => S<B>, s: S<A>): S<B> {
  return (sink_, schedule) => {
    const m: Map<number, D> = new Map()
    const ref = aRef()
    const sink = aSink(ref, sink_)
    let i = 0
    const index = i++
    m.set(
      index,
      s(
        indexSink(index, m, vo => {
          const index = i++
          if (vo.type === "event") {
            m.set(
              index,
              f(vo.v)(
                indexSink(index, m, vi => {
                  if (vi.type === "event") sink(event(vi.t - vo.t, vi.v))
                  else if (vi.type === "end") sink(end(vi.t - vo.t))
                  else sink(error(vi.t - vo.t, vi.v))
                }),
                schedule
              )
            )
          } else {
            sink(vo)
          }
        }),
        schedule
      )
    )
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
      if (f != null) f()
    }
  }
}
