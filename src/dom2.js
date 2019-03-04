// @flow strict
import * as S from './stream2'

type SS<A> = S.S<A> | A

type Dom$attr = { t: 'Dom$attr', a: { [string]: string } }
export const attr = (a: $PropertyType<Dom$attr, 'a'>): Dom$attr => {
  return {
    t: 'Dom$attr',
    a
  }
}

type Dom$style = {
  t: 'Dom$style',
  a: { [$Keys<CSSStyleDeclaration>]: string }
}
export const style = (a: $PropertyType<Dom$style, 'a'>): Dom$style => ({
  t: 'Dom$style',
  a
})

// type Dom$elm = {
//   t: 'Dom$elm',
//   attr: Dom$attr,
//   b: Dom$style,
//   c: Dom$pith
// }
// export const elm = (
//   attr: Dom$attr,
//   b: $PropertyType<Dom$elm, 'b'>,
//   c: $PropertyType<Dom$elm, 'c'>
// ): Dom$elm => ({
//   t: 'Dom$elm',
//   attr,
//   b,
//   c
// })
//
// type Dom$text = { t: 'Dom$text', a: S$pith<string> }
// export const text = (a: $PropertyType<Dom$text, 'a'>): Dom$text => ({
//   t: 'Dom$text',
//   a
// })
//
// type Dom$pith = {
//   t: 'Dom$pith',
//   a: S$pith<((Dom$elm, Dom$text) => void) => void>
// }
// export const pith = (a: $PropertyType<Dom$pith, 'a'>): Dom$pith => ({
//   t: 'Dom$pith',
//   a
// })
