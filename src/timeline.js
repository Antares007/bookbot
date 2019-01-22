// @flow
import type { IO } from "./io.js"

export opaque type Timeline<T> =
  | Array<[number, T]>
  | { l: Timeline<T>, r: Timeline<T> }

function findAppendPosition<T>(n: number, line: Array<[number, T]>): number {
  var l = 0
  var r = line.length
  while (true) {
    if (l < r) {
      const m = ~~((l + r) / 2) | 0
      if (line[m][0] > n) {
        r = m
        continue
      } else {
        l = m + 1
        continue
      }
    } else {
      return l - 1
    }
  }
  throw new Error("never")
}

export function fromPith<a>(
  mappend: (a, a) => a,
  pith: (([number, a]) => void) => void
): ?Timeline<a> {
  const line = []
  pith(na => {
    const i = findAppendPosition(na[0], line)
    if (i > -1 && line[i][0] === na[0]) {
      line[i][1] = mappend(line[i][1], na[1])
    } else {
      line.splice(i + 1, 0, na)
    }
  })
  if (line.length === 0) return null
  return line
}

export function toPith<T>(tl: Timeline<T>): (([number, T]) => void) => void {
  return o => {
    if (Array.isArray(tl)) {
      for (var i = 0, l = tl.length; i < l; i++) o(tl[i])
    } else {
      toPith(tl.l)(o)
      toPith(tl.r)(o)
    }
  }
}

export function getBounds<T>(tl: Timeline<T>): [number, number] {
  if (Array.isArray(tl)) {
    return [tl[0][0], tl[tl.length - 1][0]]
  } else {
    return [getBounds(tl.l)[0], getBounds(tl.r)[1]]
  }
}

export function mappend<T>(
  mappenda: (T, T) => T,
  l: Timeline<T>,
  r: Timeline<T>
): Timeline<T> {
  const lb = getBounds(l)
  const rb = getBounds(r)
  if (lb[0] > rb[0]) return mappend(mappenda, r, l)
  if (lb[1] < rb[0]) return { l, r }

  if (Array.isArray(l)) {
    if (Array.isArray(r)) {
      const a = l
      const b = r
      return (fromPith(mappenda, o => {
        for (let i = 0, len = a.length; i < len; i++) o(a[i])
        for (let i = 0, len = b.length; i < len; i++) o(b[i])
      }): any)
    } else {
      if (lb[1] < getBounds(r.r)[0]) {
        const a = l
        const b = r.l
        return {
          l: (fromPith(mappenda, o => {
            for (let i = 0, len = a.length; i < len; i++) o(a[i])
            toPith(b)(o)
          }): any),
          r: r.r
        }
      }
      const a = l
      const b = r
      return (fromPith(mappenda, o => {
        for (let i = 0, len = a.length; i < len; i++) o(a[i])
        toPith(b)(o)
      }): any)
    }
  } else {
    if (Array.isArray(r)) {
      if (getBounds(l.l)[1] < rb[0]) {
        const a = l.r
        const b = r
        return {
          l: l.l,
          r: (fromPith(mappenda, o => {
            toPith(a)(o)
            for (let i = 0, len = b.length; i < len; i++) o(b[i])
          }): any)
        }
      }
      const a = l
      const b = r
      return (fromPith(mappenda, o => {
        toPith(a)(o)
        for (let i = 0, len = b.length; i < len; i++) o(b[i])
      }): any)
    } else {
      const a = l
      const b = r
      return (fromPith(mappenda, o => {
        toPith(a)(o)
        toPith(b)(o)
      }): any)
    }
  }
}

//
// export function show<T>(tl: Timeline<T>) {
//   const go = tl => {
//     if (tl.tag === "Line") {
//       console.log(tl.line)
//     } else {
//       console.group("left")
//       go(tl.left)
//       console.groupEnd()
//       console.group("right")
//       go(tl.right)
//       console.groupEnd()
//     }
//   }
//   const bonds = getBounds(tl)
//   console.group("TimeLine " + bonds[0] + " - " + bonds[1])
//   go(tl)
//   console.groupEnd()
// }
//
// export function fromIO<T>(
//   mappend: (T, T) => T,
//   io: IO<void, [number, T], void>
// ): ?Timeline<T> {
//   const line = []
//   io(na => {
//     const i = findAppendPosition(na[0], line)
//     if (i > -1 && line[i][0] === na[0]) {
//       line[i][1] = mappend(line[i][1], na[1])
//     } else {
//       line.splice(i + 1, 0, na)
//     }
//   })()
//   if (line.length === 0) return null
//   return { tag: "Line", line }
// }
//
// function runTo<T>(
//   mappendt: (T, T) => T,
//   n: number,
//   tl: Timeline<T>
// ): IO<void, [number, T], ?Timeline<T>> {
//   return o => () => {
//     if (tl.tag === "Line") {
//       const ap = findAppendPosition(n, tl.line)
//       if (ap === -1) return tl
//       for (var i = 0; i <= ap; i++) {
//         o(tl.line[i])
//       }
//       if (ap === tl.line.length - 1) return null
//       return { tag: "Line", line: tl.line.slice(ap + 1) }
//     } else {
//       let l = runTo(mappendt, n, tl.left)(o)()
//       let r = runTo(mappendt, n, tl.right)(o)()
//       if (l != null && r != null) return mappend(mappendt, l, r)
//       if (l != null) return l
//       if (r != null) return r
//     }
//   }
// }
//
// function toIO<T>(tl: Timeline<T>): IO<void, [number, T], void> {
//   return o => () => {
//     if (tl.tag === "Line") {
//       for (var i = 0, l = tl.line.length; i < l; i++) o(tl.line[i])
//     } else {
//       toIO(tl.left)(o)()
//       toIO(tl.right)(o)()
//     }
//   }
// }
//
//
