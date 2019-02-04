// @flow strict
export type Disposable = { dispose: () => void }

export function create(f: () => void): Disposable {
  var disposed = false
  return {
    dispose: () => {
      if (disposed) return
      f()
      disposed = true
    }
  }
}

export function mappend(...lr: Array<Disposable>): Disposable {
  return {
    dispose: () => {
      for (var d of lr) d.dispose()
    }
  }
}

export const empty: Disposable = {
  dispose: () => {}
}
