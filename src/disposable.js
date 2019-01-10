//@flow
export opaque type Disposable: () => void = () => void

export function rtrn(f: () => void): Disposable {
  var disposed = false
  return () => {
    if (disposed) return
    f()
    disposed = true
  }
}

export function mappend(l: Disposable, r: Disposable): Disposable {
  return () => {
    l()
    r()
  }
}
