// @flow strict-local
import { S, event, end, empty } from './stream'
import { defaultScheduler } from './scheduler'

type Pith<A> = ((S<O<A>> | O<A>) => void) => void

type O<A> =
  | { type: 'element', pith: Pith<A>, tag: string }
  | { type: 'text', text: string }
type Patch = () => void

const elm = <A>(tag: string, pith: Pith<A>): O<A> => ({
  type: 'element',
  tag,
  pith
})
const text = (text: string) => ({ type: 'text', text })

const counter = S.at(
  elm('div', o => {
    o(
      S.at(
        elm('button', o => {
          o(text('+'))
        })
      )
    )
    o(
      S.at(
        elm('button', o => {
          o(text('-'))
        })
      )
    )
    o(
      S.at(
        elm('button', o => {
          o(
            S.periodic(4000)
              .scan(a => a + 1, 0)
              .map(a => (console.log('a', a), a))
              .map(n => text('hello ' + n))
          )
        })
      )
    )
    o(
      S.periodic(3000)
        .scan(a => a + 1, 0)
        .map(n =>
          n % 2 === 0 ? text('hello ' + n) : elm('button', o => o(text('ok')))
        )
    )
  })
)
const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

run(rootNode, counter)
  .map(p => p())
  .run(console.log.bind(console), defaultScheduler)

function run<A: Node>(elm: A, i: S<O<A>> | O<A>): S<Patch> {
  var limap = new Map()

  return S.switchLatest(
    toS(i).map(i => {
      if (i.type === 'text')
        return S.at(() => {
          if (elm.textContent !== i.text) elm.textContent = i.text
        })
      const ss: Array<S<O<A>>> = []
      i.pith(i => (ss.push(toS(i)), void 0))

      return S.switchLatest(
        S.combine((...is) => {
          const l = is.length
          var li: ?A = null
          const patches = []
          const newlimap = new Map()
          for (var index = 0; index < l; index++) {
            var i = is[index]
            if (i.type === 'text') {
              li = elm.childNodes[index]
              if (li == null || li.nodeName !== '#text')
                li = elm.insertBefore(document.createTextNode(''), li)
              patches.push(run(li, i))
            } else {
              for (var j = index; j < l; j++)
                if ((li = elm.childNodes[j]) && limap.get(li) === ss[index]) {
                  break
                } else li = null
              if (li == null)
                li = elm.insertBefore(
                  document.createElement(i.tag),
                  elm.childNodes[index]
                )
              else if (j !== index) elm.insertBefore(li, elm.childNodes[index])
              newlimap.set(li, ss[index])
              patches.push(run(li, i))
            }
          }
          limap = newlimap
          return S.combine(
            (...patches) => () => {
              patches.forEach(p => p())
              for (var j = elm.childNodes.length - 1; j >= index; j--)
                console.log('rm', elm.removeChild(elm.childNodes[j]))
            },
            ...patches
          )
        }, ...ss)
      )
    })
  )
}

function toS<A>(so: S<O<A>> | O<A>): S<O<A>> {
  return so instanceof S ? so : S.at(so)
}
