// @flow strict
import * as S from '../S'

export function animationFramePatcher(node: Node): ((Node) => void) => void {
  var patches = []
  window.requestAnimationFrame(function rec() {
    var p
    while ((p = patches.shift())) p(node)
    window.requestAnimationFrame(rec)
  })
  return p => {
    patches.push(p)
  }
}

export function linearPatcher(node: Node, speed: number = 17): ((Node) => void) => void {
  const patches = []
  window.speed = speed
  S.delay(function rec() {
    const p = patches.shift()
    if (p) {
      console.log(p.toString())
      p(node)
    }
    S.delay(rec, window.speed)
  })
  return p => {
    patches.push(p)
  }
}
