//@flow
export opaque type Disposable: { dispose: () => void } = { dispose: () => void }

export function rtrn(f: () => void): Disposable {
  var disposed = false
  return {
    dispose: () => {
      if (disposed) return
      f()
      disposed = true
    }
  }
}

export function mappend(l: Disposable, r: Disposable): Disposable {
  return {
    dispose: () => {
      l.dispose()
      r.dispose()
    }
  }
}

export const empty: Disposable = {
  dispose: () => {}
}
