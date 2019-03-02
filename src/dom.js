// @flow strict-local
import { S, Subject } from './stream'
import * as n from './pnode'
import { defaultScheduler } from './scheduler'

type SS<A> = S<A> | A

type Attr$Attribute = { type: 'attribute', v: { [string]: string } }
type Attr$Style = { type: 'style', v: { [$Keys<CSSStyleDeclaration>]: string } }
type Attr$On<Action> = { type: 'on', name: string, action: Event => Action }

type Attr$Attribs<Action> = Array<
  SS<Attr$Attribute | Attr$Style | Attr$On<Action>>
>

export const attr = (v: { [string]: string }): Attr$Attribute => ({
  type: 'attribute',
  v
})
export const style = (v: {
  [$Keys<CSSStyleDeclaration>]: string
}): Attr$Style => ({
  type: 'style',
  v
})
export const on = <Action>(
  name: string,
  action: Event => Action
): Attr$On<Action> => ({
  type: 'on',
  name,
  action
})

type Pith<Action> = (
  (SS<Elm$Text | Elm$Elm<Action>>) => void,
  S<Action>
) => void

type Elm$Elm<Action> = {
  type: 'element',
  tag: string,
  key?: string,
  attrs: Attr$Attribs<Action>,
  pith: Pith<Action>
}
type Elm$Text = { type: 'text', text: string }
type Elm$Pith<Action> = {
  type: 'pith',
  pith: Pith<Action>
}

export const elm = <Action>(
  tag: string,
  attrs: Attr$Attribs<Action>,
  pith: Pith<Action>,
  key?: string
): Elm$Elm<Action> => ({
  type: 'element',
  tag: tag.toUpperCase(),
  attrs,
  pith,
  key
})
export const text = (text: string): Elm$Text => ({ type: 'text', text })
export const pith = <Action>(pith: Pith<Action>): Elm$Pith<Action> => ({
  type: 'pith',
  pith
})

export function run<Action>(pith: SS<Elm$Pith<Action>>): S<(Node) => void> {
  const proxy = new Subject()
  const ring = (pith: Pith<Action>) =>
    n.pith((o, l) =>
      pith(v => {
        o(
          toS(v).map(v => {
            if (v.type === 'text')
              return n.node(
                () => (document.createTextNode(v.text): Node),
                n => n.nodeName === '#text',
                n => {
                  if (n.textContent === text) n.textContent = v.text
                }
              )
            return n.node(
              () => {
                const elm = document.createElement(v.tag)
                if (v.key != null) elm.dataset.key = v.key
                return (elm: Node)
              },
              elm =>
                elm.nodeName === v.tag &&
                (v.key == null ||
                  (elm instanceof HTMLElement && elm.dataset.key === v.key)),
              n.run(ring(v.pith))
            )
          })
        )
      }, proxy)
    )
  let see = n.run(toS(pith).map(pith => ring(pith.pith)))
  return see
}

function toS<A>(ss: S<A> | A): S<A> {
  return ss instanceof S ? ss : S.at(ss)
}
