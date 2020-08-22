// @flow strict
import * as E from "./elm_pith";
const { dispose, element, makeElementPith } = E;

const C = (i: number) => {
  var n = 0;
  var op;
  return (ob) =>
    element(
      "div",
      (o) => {
        element("button", (o, elm) => {
          const listener = (e: MouseEvent) => {
            ob(1);
            n++;
            op((o) => o(n + ""));
          };
          elm.addEventListener("click", listener);
          dispose(() => elm.removeEventListener("click", listener))(o);
          o("+");
          if (i > 0)
            C(i - 1)((x: E.O | number) =>
              typeof x === "number" ? ob(x) : o(x)
            );
        })(o);
        element("button", (o, elm) => {
          const listener = (e: MouseEvent) => {
            ob(-1);
            n--;
            op((o) => o(n + ""));
          };
          elm.addEventListener("click", listener);
          dispose(() => elm.removeEventListener("click", listener))(o);
          o("-");
          if (i > 0)
            C(i - 1)((x: E.O | number) =>
              typeof x === "number" ? ob(x) : o(x)
            );
        })(o);
        element("div", (o) => {
          op = o;
          o(n + "");
        })(o);
      },
      "C" + i
    )(ob);
};
const o = makeElementPith((document.body = document.createElement("body")));
o((o) =>
  C(1)((x: E.O | number) =>
    typeof x === "number" ? console.log(x) : o((x: E.O))
  )
);
Object.assign(window, {
  o,
  element,
  dispose,
  makeElementPith,
  C,
});
