//@flow strict
import type { Scheduler } from "./scheduler.js"
import { local } from "./scheduler.js"

export type Sink<A> = {
  +event: (t: number, a: A) => void,
  +end: (t: number) => void,
  +error: (t: number, err: Error) => void
}
export type S<A> = (Sink<A>, Scheduler) => D

type D = { +dispose: () => void }
type CRef = { canceled: boolean }

const emptyDisposable: D = { dispose: () => {} }

export function createAt<A>(
  delay: number,
  f: (sink: Sink<A>, scheduler: Scheduler, cref: CRef) => ?D
): S<A> {
  const cref = { canceled: false }
  return (sink, scheduler) => {
    let d: ?D = null
    scheduler(delay, t => {
      if (cref.canceled) return
      try {
        d = f(sink, local(delay, scheduler), cref)
      } catch (err) {
        sink.error(delay, err instanceof Error ? err : new Error(err + ""))
      }
    })
    return {
      dispose() {
        cref.canceled = true
        if (d != null) d.dispose()
      }
    }
  }
}

export function empty<A>(): S<A> {
  return () => emptyDisposable
}

export function at<A>(a: A, delay: number): S<A> {
  return createAt(delay, (sink, scheduler, cref) => {
    sink.event(delay, a)
    if (cref.canceled) return
    sink.end(delay)
  })
}

export function throwError(err: Error): S<Error> {
  return createAt(0, (sink, scheduler, cref) => {
    sink.error(0, err)
  })
}

export function map<A, B>(f: A => B, s: S<A>): S<B> {
  return (sink, scheduler) =>
    s(
      {
        event: (t, v) => sink.event(t, f(v)),
        end: sink.end,
        error: sink.error
      },
      scheduler
    )
}

export function fromArray<A>(as: Array<A>): S<A> {
  return createAt(0, (sink, scheduler, cref) => {
    for (let i = 0, l = as.length; i < l; i++) {
      sink.event(0, as[i])
      if (cref.canceled) return
    }
    sink.end(0)
  })
}

export function flatMap<A, B>(f: A => S<B>, s: S<A>): S<B> {
  return (sink, scheduler) => {
    let active = true
    let i = 0
    let size = 0
    const dmap: { [number | string]: { +dispose: () => void } } = {}
    const d = {
      dispose() {
        active = false
        for (var key in dmap) dmap[key].dispose()
      }
    }
    const _end = (t, index) => {
      delete dmap[index]
      if (--size === 0) {
        active = false
        sink.end(t)
      }
    }
    const _error = (t, err) => {
      if (active) {
        d.dispose()
        sink.error(t, err)
      }
    }
    const index = i++
    size++
    dmap[index] = s(
      {
        event(t0, a) {
          if (!active) return
          const index = i++
          size++
          dmap[index] = f(a)(
            {
              event(t, v) {
                if (!active) return
                sink.event(t + t0, v)
              },
              end: t => _end(t + t0, index),
              error: (t, err) => _error(t + t0, err)
            },
            scheduler
          )
        },
        end: t0 => _end(t0, index),
        error: (t0, err) => _error(t0, err)
      },
      scheduler
    )
    return d
  }
}
