// @flow strict
export class Disposable {
  disposed: boolean
  dispose: () => void
  constructor(dispose: $PropertyType<Disposable, 'dispose'>) {
    this.disposed = false
    this.dispose = dispose
  }
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.dispose()
  }
}

export function create(dispose: $PropertyType<Disposable, 'dispose'>): Disposable {
  return new Disposable(dispose)
}

export const empty: Disposable = new Disposable(() => {})

export const mappend = (...ds: Array<Disposable>): Disposable => {
  return create(() => {
    var d
    while ((d = ds.shift())) d.dispose()
  })
}
