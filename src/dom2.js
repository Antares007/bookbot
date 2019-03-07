// @flow strict
import * as S from './stream2'
import * as P from './pnode2'

type SS<A> = S.S<A> | A

export class Attr {
  map: { [string]: ?string }
  constructor(map: $PropertyType<Attr, 'map'>) {
    this.map = map
  }
}
export function attr(map: $PropertyType<Attr, 'map'>): Attr {
  return new Attr(map)
}

export class Style {
  map: { [$Keys<CSSStyleDeclaration>]: ?string }
  constructor(map: $PropertyType<Style, 'map'>) {
    this.map = map
  }
}
export function style(map: $PropertyType<Style, 'map'>): Style {
  return new Style(map)
}

export class Action<A> {
  map: { [MouseEventTypes | string]: ?(Event) => A }
  constructor(map: $PropertyType<Action<A>, 'map'>) {
    this.map = map
  }
}
export function action<A>(map: $PropertyType<Action<A>, 'map'>): Action<A> {
  return new Action(map)
}

export class Elm<A> {
  tag: string
  key: ?string
  attrs: ?S.S<Attr>
  styles: ?S.S<Style>
  actions: ?S.S<Action<A>>
  piths: S.S<Pith<A>>
  constructor(
    tag: $PropertyType<Elm<A>, 'tag'>,
    key: $PropertyType<Elm<A>, 'key'>,
    attrs: $PropertyType<Elm<A>, 'attrs'>,
    styles: $PropertyType<Elm<A>, 'styles'>,
    actions: $PropertyType<Elm<A>, 'actions'>,
    piths: $PropertyType<Elm<A>, 'piths'>
  ) {
    this.tag = tag.toUpperCase()
    this.key = key
    this.attrs = attrs
    this.styles = styles
    this.actions = actions
    this.piths = piths
  }
}
export function elm<A>(
  tag: string,
  attrsList: Array<SS<Attr | Style | Action<A>>>,
  piths: SS<$PropertyType<Pith<A>, 'pith'> | Pith<A>>,
  key?: string
): Elm<A> {
  const piths_ = (piths instanceof S.S ? piths : S.at(piths)).map(x =>
    x instanceof Pith ? x : pith(x)
  )
  if (attrsList.length === 0)
    return new Elm<A>(tag, key, null, null, null, piths_)

  var s: ?S.S<Attr | Style | Action<A>>
  var attrMap: $PropertyType<Attr, 'map'> = {}
  var attrs: ?S.S<Attr>
  var styleMap: $PropertyType<Style, 'map'> = {}
  var styles: ?S.S<Style>
  var actionMap: $PropertyType<Action<A>, 'map'> = {}
  var actions: ?S.S<Action<A>>
  for (var x of attrsList) {
    if (x instanceof S.S) {
      s = s ? S.merge(s, x) : x
    } else if (x instanceof Attr) {
      attrMap = { ...attrMap, ...x.map }
      if (!attrs) attrs = S.at(attr({}))
    } else if (x instanceof Style) {
      styleMap = { ...styleMap, ...x.map }
      if (!styles) styles = S.at(style({}))
    } else {
      actionMap = { ...actionMap, ...x.map }
      if (!actions) actions = S.at(action({}))
    }
  }
  attrs =
    attrs && s
      ? attrs.merge(s.filter2(x => (x instanceof Attr ? x : null)))
      : s != null
      ? s.filter2(x => (x instanceof Attr ? x : null))
      : attrs
  styles =
    styles && s
      ? styles.merge(s.filter2(x => (x instanceof Style ? x : null)))
      : s != null
      ? s.filter2(x => (x instanceof Style ? x : null))
      : styles
  actions =
    actions && s
      ? actions.merge(s.filter2(x => (x instanceof Action ? x : null)))
      : s != null
      ? s.filter2(x => (x instanceof Action ? x : null))
      : actions
  return new Elm<A>(
    tag,
    key,
    attrs ? attrs.map(x => attr({ ...x.map, ...attrMap })) : null,
    styles ? styles.map(x => style({ ...x.map, ...styleMap })) : null,
    actions ? actions.map(x => action({ ...x.map, ...actionMap })) : null,
    piths_
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
export function pith<A>(pith: $PropertyType<Pith<A>, 'pith'>): Pith<A> {
  return new Pith<A>(pith)
}

export function run<A>(piths: SS<Pith<A>>): S.S<P.Patch> {
  const ring = (pith: Pith<A>) =>
    P.pith(o => {
      pith.pith(v => {
        if (v instanceof Str) {
          o(
            P.pnode(
              () => document.createTextNode(''),
              n => n.nodeName === '#text',
              o =>
                o(
                  v.texts.map(text =>
                    P.patch(n => {
                      n.textContent = text
                    })
                  )
                )
            )
          )
        } else {
          o(
            P.pnode(
              () => {
                const elm = document.createElement(v.tag)
                if (v.key) elm.dataset.key = v.key
                return elm
              },
              n =>
                n.nodeName === v.tag &&
                (v.key == null ||
                  (n instanceof HTMLElement && n.dataset.key === v.key)),
              v.piths.map(ring).map(pith => o => {
                if (v.actions) {
                  var actionMap = {}
                  const mkListener = (
                    toAction: (e: Event) => A
                  ): (Event => void) & { toAction(Event): A } => {
                    handler.toAction = toAction
                    return handler
                    function handler(e: Event) {
                      console.log('Event', handler.toAction(e))
                    }
                  }
                  o(
                    v.actions.map(({ map }) =>
                      P.patch(node => {
                        for (var key in actionMap)
                          if (map[key] == null) {
                            node.removeEventListener(key, actionMap[key])
                            delete actionMap[key]
                          }
                        for (var key in map)
                          if (actionMap[key] == null && map[key] != null) {
                            const l = mkListener(map[key])
                            node.addEventListener(key, l)
                            actionMap[key] = l
                          } else if (
                            actionMap[key] != null &&
                            map[key] != null
                          ) {
                            actionMap[key].toAction = map[key]
                          }
                      })
                    )
                  )
                }
                pith.pith(o)
              })
            )
          )
        }
      }, S.empty())
    })
  return P.run(piths instanceof S.S ? piths.map(ring) : S.at(ring(piths)))
}
