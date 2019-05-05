// @flow
import * as S from './S'
import { div, button, input, ul, li } from './N/ctors'
import { extend } from './N/rings'
import { run } from './N/SN'
import { linearPatcher } from './N/patchers'

const initState = {
  id: 0,
  inputText: 'b',
  todos: [{ id: 0, name: 'a', completed: false }]
}

type Model = {
  id: number,
  inputText: string,
  todos: Array<{ id: number, name: string, completed: boolean }>
}
const inputBox = extend('inputText', '')(
  input((o, i) => {
    o.props(i.states.map(inputText => ({ value: inputText })))
    o.reduce(
      i.on
        .input()
        .map(e => inputText => (e.target instanceof HTMLInputElement ? e.target.value : ''))
    )
  })
)
const todo = div<Model>((o, i) => {
  o(
    div((o, i) => {
      o(
        input((o, i) => {
          o.props(i.states.map(m => ({ value: m.inputText })))
          o.reduce(
            i.on.input().map(e => s => ({
              ...s,
              inputText: e.target instanceof HTMLInputElement ? e.target.value : ''
            }))
          )
        }),
        button((o, i) => {
          o('add')
          o.attrs(i.states.map(m => ({ disabled: m.inputText.trim().length > 0 ? null : '' })))
          o.reduce(
            i.on.click().map(_ => s => ({
              id: s.id + 1,
              inputText: '',
              todos: s.todos.concat([{ id: s.id + 1, name: s.inputText, completed: false }])
            }))
          )
        }),
        button((o, i) => {
          o('reverse')
          o.reduce(
            i.on.click().map(_ => s => ({
              ...s,
              todos: s.todos.reverse().slice()
            }))
          )
        })
      )
    }),
    i.states
      .map(m => m.todos)
      .skipEquals()
      .map(todos =>
        ul((o, i) => {
          for (let todo of todos)
            o(
              li((o, i) => {
                o(
                  todo.name,
                  button((o, i) => {
                    o('remove')
                    o.reduce(
                      i.on.click().map(_ => s => ({
                        ...s,
                        todos: s.todos.filter(x => x !== todo)
                      }))
                    )
                  })
                )
              }, 'k' + todo.id)
            )
        })
      )
  )
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root-node')

const states = run(linearPatcher(rootNode), initState, todo)

states.run(e => {
  if (e instanceof S.Next) console.log(JSON.stringify(e.value, null, '  '))
  else if (e instanceof Error) console.error(e)
  else console.info(e)
})
