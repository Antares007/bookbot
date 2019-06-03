// @flow strict
type Pith<S> = (((S) => S) => void) => void

function bark<S>(pith: Pith<S>): S => S {
  return ps => {
    var s = ps
    pith(r => {
      s = r(s)
    })
    return s
  }
}

function n<B, A: {}>(k: string, b: B, pith: Pith<B>): A => A {
  return a => ({
    ...a,
    [k]: bark(pith)(a[k] || b)
  })
}

const rez = bark(o => {
  o(n('k', { a: 42 }, o => {}))
  o(a => ({
    ...a,
    c: bark(o => {
      o(s => s)
    })(a.c || { j: 1 })
  }))
})({})

console.log(rez)
