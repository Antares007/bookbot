// @flow
import * as S from "./S";
import type { NPith } from "./N";
import * as N from "./N";

const initState = {
  inputText: "",
  todos: [],
};

type Model = typeof initState;

const todoApp = N.elm<Model>("div", (o, i) => {
  o(
    N.elm("div", (o, i) => {
      o(
        N.elm("input", (o, i) => {
          o(
            i.states.map((m) =>
              N.patch((n) => {
                if (n instanceof HTMLInputElement) n.value = m.inputText;
              })
            )
          );
          o(
            i.on.input().map((e) =>
              N.r((s) => ({
                ...s,
                inputText:
                  e.target instanceof HTMLInputElement ? e.target.value : "",
              }))
            )
          );
        })
      );
      o(
        N.elm("button", (o, i) => {
          o(N.text("add"));
          o(
            i.on.click().map((_) =>
              N.r((s) => ({
                inputText: "",
                todos: s.todos.concat([
                  { name: s.inputText, completed: false },
                ]),
              }))
            )
          );
          o(
            i.states.map((m) =>
              N.patch((n) => {
                if (n instanceof HTMLElement)
                  if (m.inputText.trim().length > 0)
                    n.removeAttribute("disabled");
                  else n.setAttribute("disabled", "");
              })
            )
          );
        })
      );
    })
  );
  o(
    N.elm(
      "ul",
      i.states.map((m) => (o, i) => {
        for (let todo of m.todos)
          o(N.elm("li", (o) => o(N.text(todo.name)), todo.name));
      })
    )
  );
});

const rootNode = document.getElementById("root-node");
if (!rootNode) throw new Error("cant find root-node");

N.run(
  rootNode,
  JSON.parse(localStorage.getItem("todo") || JSON.stringify(initState)),
  todoApp
).run((e) => {
  if (e instanceof S.Next) {
    const ns = JSON.stringify(e.value, null, "  ");
    localStorage.setItem("todo", ns);
    console.log(ns);
  } else console.info(e);
});
