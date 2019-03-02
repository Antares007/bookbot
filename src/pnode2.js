// @flow strict
import type { S$pith } from './stream2'
import * as S from './stream2'

export type PNode$patch = { t: 'PNode$patch', a: S$pith<(Node) => void> }
const patch = (a: $PropertyType<PNode$patch, 'a'>): PNode$patch => ({
  t: 'PNode$patch',
  a
})

export type PNode$pith = {
  t: 'PNode$pith',
  a: ((PNode$node | PNode$patch) => void) => void
}
const pith = (a: $PropertyType<PNode$pith, 'a'>): PNode$pith => ({
  t: 'PNode$pith',
  a
})

export type PNode$node = {
  t: 'PNode$node',
  a: () => Node,
  b: Node => boolean,
  c: S$pith<PNode$pith>
}
const node = (
  a: $PropertyType<PNode$node, 'a'>,
  b: $PropertyType<PNode$node, 'b'>,
  c: $PropertyType<PNode$node, 'c'>
): PNode$node => ({ t: 'PNode$node', a, b, c })

export function run(spith: S$pith<PNode$pith>): S$pith<(Node) => void> {
  return S.switchLatest(
    S.map(x => {
      const patches: Array<S$pith<(Node) => void>> = []
      var i = 0
      x.a(x => {
        if (x.t === 'PNode$patch') return
        const index = i++
        patches.push(
          S.map(
            p => parent => {
              var li: ?Node
              for (var i = index, l = parent.childNodes.length; i < l; i++)
                if (x.b((li = parent.childNodes[i]))) break
                else li = null
              if (li == null)
                li = parent.insertBefore(x.a(), parent.childNodes[index])
              else if (i !== index)
                parent.insertBefore(li, parent.childNodes[index])
              p(li)
            },
            run(x.c)
          )
        )
      })
      patches.push(
        S.at(parent => {
          for (var j = parent.childNodes.length - 1; j >= i; j--)
            parent.removeChild(parent.childNodes[j])
        })
      )
      var lastPatches: Array<(Node) => void> = []
      return S.combine(
        array => parent => {
          var i = 0
          const l = array.length
          for (; i < l; i++) if (array[i] !== lastPatches[i]) break
          for (; i < l; i++) array[i](parent)
          lastPatches = array
        },
        patches
      )
    }, spith)
  )
}
