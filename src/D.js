// @flow strict
import * as S from './S'
import * as N from './N'
import * as Rings from './N/rings'

let see = N.elm('div', (o, i) => {
  o(S.d(N.r(s => s)))
}).pmap(p =>
  Rings.extend('', { aaa: 1, bbb: '', maaash: true })(
    Rings.props(Rings.attrs(Rings.on(p)))
  )
)

let see2 = N.srun(document.createElement('div'), { a: 42 }, see)
