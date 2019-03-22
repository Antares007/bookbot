// @flow strict
export class Disposable {
  dispose: () => void
  constructor(dispose: $PropertyType<Disposable, 'dispose'>) {
    this.dispose = dispose
  }
  dispose(): void {
    this.dispose()
  }
}

export function create(
  dispose: $PropertyType<Disposable, 'dispose'>
): Disposable {
  return new Disposable(dispose)
}

export const empty: Disposable = new Disposable(() => {})
