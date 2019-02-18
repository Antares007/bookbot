// @flow strict
import { S } from '../../src/stream'
import * as s from '../../src/stream'
import { Scheduler } from '../../src/scheduler'

export function toTl<A>(s: S<A>): Promise<Array<[number, string]>> {
  return new Promise((resolve, reject) => {
    var t = 0
    const scheduler = new Scheduler(
      () => t,
      (d, f) => {
        Promise.resolve(d).then(d => ((t += d), f()))
      }
    )
    const vs = []
    const d = s.run(e => {
      vs.push([
        e.t,
        e.type === 'event' ? String(e.v) : e.type === 'end' ? '|' : e.v.message
      ])
    }, scheduler)
    scheduler.delay(99, t => {
      resolve(vs.slice(0))
    })
  })
}

export function sOf(str: string): S<string> {
  const line = tlOf(str)
  return S.of((sink, schdlr) => {
    schdlr.delay(0, t0 => {
      for (let p of line) {
        schdlr.delay(p[0], t =>
          p[1] === '|'
            ? sink(s.end(t))
            : p[1] === 'X'
            ? sink(s.error(t, new Error('X')))
            : sink(s.event(t, p[1]))
        )
      }
    })
    return { dispose() {} }
  })
}

export function tlOf(str: string): Array<[number, string]> {
  const line = []
  let ival = 1
  let t = 0
  for (let i = 0, l = str.length; i < l; i++) {
    let chr = str[i]
    if (chr === ' ') continue
    if (chr === '-') {
      t += ival
      continue
    }
    if (chr === '(') {
      ival = 0
      continue
    }
    if (chr === ')') {
      ival = 1
      t += ival
      continue
    }
    line.push([t, chr])
    t += ival
  }
  return line
}
