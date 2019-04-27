// @flow strict
import * as S from './S'
import type { NPith } from './N'
import * as N from './N'

const initState = {
  inputText: 'b',
  todos: [{ name: 'a', completed: false }]
}

type Model = {
  inputText: string,
  todos: Array<{ name: string, completed: boolean }>
}

const todo = N.elm<Model>('div', (o, i) => {
  o.node(
    N.elm('div', (o, i) => {
      o.node(
        N.elm('input', (o, i) => {
          const on = new S.On(i.ref)
          o.patch(
            i.states.map(m => n => {
              if (n instanceof HTMLInputElement && n.value !== m.inputText) n.value = m.inputText
            })
          )
          o.reduce(
            on.input().map(e => s => ({
              ...s,
              inputText: e.target instanceof HTMLInputElement ? e.target.value : ''
            }))
          )
        })
      )
      o.node(
        N.elm('button', (o, i) => {
          const on = new S.On(i.ref)
          o.node(N.text('add'))
          o.patch(
            i.states.map(m => n => {
              if (n instanceof HTMLElement)
                if (m.inputText.trim().length > 0) n.removeAttribute('disabled')
                else n.setAttribute('disabled', '')
            })
          )
          o.reduce(
            on.click().map(_ => s => ({
              inputText: '',
              todos: s.todos.concat([{ name: s.inputText, completed: false }])
            }))
          )
        })
      )
    })
  )
  o.node(
    i.states
      .map(m => m.todos)
      .skipEquals()
      .map(todos =>
        N.elm('ul', (o, i) => {
          for (let todo of todos)
            o.node(
              N.elm('li', (o, i) => {
                o.node(N.text(todo.name))
                o.node(
                  N.elm('button', (o, i) => {
                    const on = new S.On(i.ref)
                    o.node(N.text('remove'))
                    o.reduce(
                      on.click().map(_ => s => ({
                        ...s,
                        todos: s.todos.filter(x => x !== todo)
                      }))
                    )
                  })
                )
              })
            )
        })
      )
  )
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const states = N.runO(rootNode, initState, todo)

states.run(e => {
  if (e instanceof S.Next) console.log(JSON.stringify(e.value, null, '  '))
  else if (e instanceof Error) console.error(e)
  else console.info(e)
})
