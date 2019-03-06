// @flow strict
import * as S from './stream2'

type SS<A> = S.S<A> | A

export class Attr {
  map: { [string]: string }
  constructor(map: $PropertyType<Attr, 'map'>) {
    this.map = map
  }
}
export function attr(map: $PropertyType<Attr, 'map'>): Attr {
  return new Attr(map)
}

export class Style {
  map: { [string]: string }
  constructor(map: $PropertyType<Style, 'map'>) {
    this.map = map
  }
}
export function style(map: $PropertyType<Style, 'map'>): Style {
  return new Style(map)
}

export class Action<A> {
  name: MouseEventTypes
  toAction: Event => A
  constructor(
    name: $PropertyType<Action<A>, 'name'>,
    toAction: $PropertyType<Action<A>, 'toAction'>
  ) {
    this.name = name
    this.toAction = toAction
  }
}
export function action<A>(
  name: $PropertyType<Action<A>, 'name'>,
  toAction: $PropertyType<Action<A>, 'toAction'>
): Action<A> {
  return new Action(name, toAction)
}

export class Elm<A> {
  tag: string
  key: ?string
  attrs: S.S<Attr>
  styles: S.S<Style>
  actions: S.S<Action<A>>
  piths: S.S<Pith<A>>
  constructor(
    tag: $PropertyType<Elm<A>, 'tag'>,
    key: $PropertyType<Elm<A>, 'key'>,
    attrs: $PropertyType<Elm<A>, 'attrs'>,
    styles: $PropertyType<Elm<A>, 'styles'>,
    actions: $PropertyType<Elm<A>, 'actions'>,
    piths: $PropertyType<Elm<A>, 'piths'>
  ) {
    this.attrs = attrs
    this.styles = styles
    this.actions = actions
    this.piths = piths
  }
}
export function elm<A>(
  tag: string,
  attrs: Array<SS<Attr | Style | Action<A>>>,
  xpith: SS<$PropertyType<Pith<A>, 'pith'>>,
  key?: string
): Elm<A> {
  var s = S.empty()
  for (var x of attrs) s = S.merge(s, x instanceof S.S ? x : S.at(x))
  return new Elm<A>(
    tag,
    key,
    s.filter2(x => (x instanceof Attr ? x : null)),
    s.filter2(x => (x instanceof Style ? x : null)),
    s.filter2(x => (x instanceof Action ? x : null)),
    xpith instanceof S.S ? xpith.map(pith) : S.at(pith(xpith))
  )
}

export class Str {
  texts: S.S<string>
  constructor(texts: $PropertyType<Str, 'texts'>) {
    this.texts = texts
  }
}
export function str(x: SS<string>): Str {
  return new Str(x instanceof S.S ? x : S.at(x))
}

export class Pith<A> {
  pith: ((Elm<A> | Str) => void, S.S<A>) => void
  constructor(pith: $PropertyType<Pith<A>, 'pith'>) {
    this.pith = pith
  }
}
function pith<A>(pith: $PropertyType<Pith<A>, 'pith'>): Pith<A> {
  return new Pith<A>(pith)
}
