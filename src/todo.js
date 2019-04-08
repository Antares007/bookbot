// @flow
import * as S from './S'
import type { NPith } from './N'
import * as N from './N'

const initState = {
  inputText: '',
  todos: []
}

type Model = typeof initState

const todoApp = N.elm<Model>('div', (o, i) => {
  o(
    N.elm('div', (o, i) => {
      o(
        N.elm('input', (o, i) => {
          o(
            i.states.map(m =>
              N.patch(n => {
                if (n instanceof HTMLInputElement && n.value !== m.inputText)
                  n.value = m.inputText
              })
            )
          )
          o(
            i.on.input().map(e =>
              N.r(s => ({
                ...s,
                inputText:
                  e.target instanceof HTMLInputElement ? e.target.value : ''
              }))
            )
          )
        })
      )
      o(
        N.elm('button', (o, i) => {
          o(N.text('add'))
          o(
            i.on.click().map(_ =>
              N.r(s => ({
                inputText: '',
                todos: s.todos.concat([{ name: s.inputText, completed: false }])
              }))
            )
          )
          o(
            i.states.map(m =>
              N.patch(n => {
                if (n instanceof HTMLElement)
                  if (m.inputText.trim().length > 0)
                    n.removeAttribute('disabled')
                  else n.setAttribute('disabled', '')
              })
            )
          )
        })
      )
    })
  )
  o(
    N.elm(
      'ul',
      i.states
        .map(m => m.todos)
        .skipEquals()
        .map(todos => (o, i) => {
          for (let todo of todos)
            o(
              N.elm(
                'li',
                o => {
                  o(
                    N.elm('div', o => {
                      o(N.text(todo.name))
                      o(
                        N.elm('button', (o, i) => {
                          o(N.text('-'))
                          o(
                            i.on.click().map(_ =>
                              N.r(s => ({
                                ...s,
                                todos: s.todos.filter(x => x !== todo)
                              }))
                            )
                          )
                        })
                      )
                    })
                  )
                },
                todo.name
              )
            )
        })
    )
  )
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

N.run(
  rootNode,
  JSON.parse(localStorage.getItem('todo') || JSON.stringify(initState)),
  todoApp
).run(e => {
  if (e instanceof S.Next) {
    const ns = JSON.stringify(e.value, null, '  ')
    localStorage.setItem('todo', ns)
    console.log(ns)
  } else console.info(e)
})
