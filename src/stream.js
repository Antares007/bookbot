//@flow strict
import type { Scheduler } from "./scheduler.js"

export type Sink<A> = {
  +event: (t: number, a: A) => void,
  +end: (t: number) => void,
  +error: (t: number, err: Error) => void
}
export type S<A> = (Sink<A>, Scheduler) => D
export type D = { +dispose: () => void }

const emptyDisposable: D = { dispose: () => {} }

export function empty<A>(): S<A> {
  return () => emptyDisposable
}

export function at<A>(a: A, delay: number): S<A> {
  let active = true
  return (sink, scheduler) => {
    scheduler(delay, _ => {
      try {
        if (active) sink.event(delay, a)
        if (active) sink.end(delay)
      } catch (err) {
        sink.error(delay, err)
      }
    })
    return {
      dispose() {
        active = false
      }
    }
  }
}

export function throwError(err: Error): S<Error> {
  let active = true
  return (sink, scheduler) => {
    scheduler(0, _ => {
      if (active) sink.error(0, err)
    })
    return {
      dispose() {
        active = false
      }
    }
  }
}

export function fromArray<A>(as: Array<A>): S<A> {
  let active = true
  return (sink, scheduler) => {
    scheduler(0, _ => {
      try {
        for (let i = 0, l = as.length; i < l && active; i++)
          sink.event(0, as[i])
        if (active) sink.end(0)
      } catch (err) {
        sink.error(0, err instanceof Error ? err : new Error(err + ""))
      }
    })
    return {
      dispose() {
        active = false
      }
    }
  }
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

export function merge<A>(...lr: Array<S<A>>): S<A> {
  return (sink, scheduler) => {
    let active = true
    const ds: Array<?D> = []
    const d = {
      dispose() {
        if (!active) return
        active = false
        for (let d of ds) if (d) d.dispose()
      }
    }
    const { event, end, error } = sink
    for (let i = 0, l = lr.length; i < l; i++)
      ds.push(
        lr[i](
          {
            event: function mergeEvent(...args) {
              if (!active) return
              event.apply(this, args)
            },
            end: function mergeEnd(...args) {
              if (!active) return
              ds[i] = null
              let isLast = true
              for (let d of ds)
                if (d != null) {
                  isLast = false
                  break
                }
              if (!end) return
              active = false
              end.apply(this, args)
            },
            error: function mergeError(...args) {
              if (!active) return
              active = false
              d.dispose()
              error.apply(this, args)
            }
          },
          scheduler
        )
      )
    return d
  }
}

export function pair<A, B>(l: S<A>, r: S<B>): S<[A, B]> {
  return (sink, scheduler) => {
    let active = true
    const dl = l({ event() {}, end() {}, error() {} }, scheduler)
    const dr = r({ event() {}, end() {}, error() {} }, scheduler)
    const d = {
      dispose() {
        if (!active) return
        active = false
        dl.dispose()
        dr.dispose()
      }
    }
    return d
  }
}
