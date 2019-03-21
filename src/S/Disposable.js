// @flow strict
export class T {
  dispose: () => void
  constructor(dispose: $PropertyType<T, 'dispose'>) {
    this.dispose = dispose
  }
  dispose(): void {
    this.dispose()
  }
}

export function create(dispose: $PropertyType<T, 'dispose'>): T {
  return new T(dispose)
}

export const empty: T = new T(() => {})
