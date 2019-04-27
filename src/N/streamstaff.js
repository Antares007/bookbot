// @flow strict
import * as S from '../S'
import * as D from '../S/Disposable'

type SS<A> = S.S<A> | A

export function combineSS<A>(
  array: Array<SS<A>>
): S.S<{ type: 'init', v: Array<A> } | { type: 'update', v: A, index: number }> {
  return S.s(o => {
    const dmap = new Map()
    const as: Array<A> = new Array(array.length)
    const idxs = []
    o(
      D.create(() => {
        for (var d of dmap.values()) d.dispose()
      })
    )
    for (let index = 0, l = array.length; index < l; index++) {
      const a = array[index]
      if (a instanceof S.S) {
        idxs.push(index)
        dmap.set(
          index,
          S.run(e => {
            if (e instanceof S.Next) {
              if (idxs.length === 0) o(S.next({ type: 'update', v: e.value, index }))
              else {
                as[index] = e.value
                const pos = idxs.indexOf(index)
                if (pos !== -1) idxs.splice(pos, 1)
                if (idxs.length === 0) o(S.next({ type: 'init', v: as }))
              }
            } else if (e instanceof S.End) {
              dmap.delete(index)
              if (dmap.size === 0) o(e)
            } else o(e)
          }, a)
        )
      } else as[index] = a
    }
    if (idxs.length === 0) {
      o(
        S.delay(() => {
          o(S.next({ type: 'init', v: as }))
          o(S.delay(() => o(S.end)))
        })
      )
    }
  })
}

export function makeStreamController<A>(
  o: (S.Next<A> | S.End | Error | D.Disposable) => void
): {
  start: (S.S<A>) => void,
  stop: (S.S<A>) => void
} {
  const dmap = new Map()
  o(
    D.create(() => {
      for (var d of dmap.values()) d.dispose()
    })
  )
  return {
    start(s) {
      dmap.set(
        s,
        S.run(e => {
          if (e instanceof S.Next) o(e)
          else if (e instanceof S.End) {
            dmap.delete(s)
            if (dmap.size === 0) o(e)
          } else o(e)
        }, s)
      )
    },
    stop(s) {
      const d = dmap.get(s)
      if (d) {
        dmap.delete(s)
        d.dispose()
        if (dmap.size === 0) o(S.end)
      }
    }
  }
}
