// @flow strict
import * as S from './S'

type M$Pith<A> = ((S.T<A>) => void) => void

export function bark<A>(pith: M$Pith<A>): S.T<A> {
  var rez = S.empty()
  pith(s => {
    rez = rez.merge(s)
  })
  return rez
}

// // see::S<(number | string | boolean)>
// let see = bark(o => {
//   o(S.at(1))
//   o(
//     bark(o => {
//       o(S.at('2'))
//       o(
//         bark(o => {
//           o(S.at(1))
//           o(
//             bark(o => {
//               o(S.at('2'))
//               o(S.at(true))
//             })
//           )
//         })
//       )
//       o(S.at(true))
//     })
//   )
// })
