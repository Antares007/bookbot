// @flow strict
type Pith<S> = (((S) => S) => void) => void
function bark<S>(pith: Pith<S>): S => S {
  return ms => {
    var s = ms
    pith(r => {
      s = r(s)
    })
    return s
  }
}

bark(o => {
  o(s => ({ ...s, b: 'a' }))
  o(
    bark(o => {
      o(s => ({ ...s, z: 'a' }))
    })
  )
})({})
