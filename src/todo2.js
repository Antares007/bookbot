// @flow strict
import * as S from './S'
import * as D from './D'
import * as N from './N'

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

const todo = D.div<Model>((o, i) => {
  o(
    D.div((o, i) => {
      o(
        D.input((o, i) => {
          o.props(i.states.map(m => ({ value: m.inputText })))
          o.reduce(
            i.on.input().map(e => s => ({
              ...s,
              inputText: e.target instanceof HTMLInputElement ? e.target.value : ''
            }))
          )
        }),
        D.button((o, i) => {
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
        D.button((o, i) => {
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
        D.ul((o, i) => {
          for (let todo of todos)
            o(
              D.li((o, i) => {
                o(
                  todo.name,
                  D.button((o, i) => {
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

const states = N.runO(rootNode, initState, D.ring(todo))

states.run(e => {
  if (e instanceof S.Next) console.log(JSON.stringify(e.value, null, '  '))
  else if (e instanceof Error) console.error(e)
  else console.info(e)
})
