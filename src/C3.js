// @flow strict
import * as E from "./E3";

export const C = (d: number = 2) => (o: E.r_pith_t<{| n: number |}>) =>
  o.element("div", function nar(o) {
    const b = E.bark(o);
    o.element(
      "button",
      (o) => {
        o.text("+");
        o.on("click", () => {
          o.reduce((s) => ({ ...s, n: s.n + 1 })), b(nar);
        });
        d && E.mmap("+", { n: 0 })(C(d - 1))(o);
      },
      "plus" + d
    );
    o.element(
      "button",
      (o) => {
        o.text("-");
        o.on("click", () => {
          o.reduce((s) => ({ ...s, n: s.n - 1 })), b(nar);
        });
        d && E.mmap("-", { n: 0 })(C(d - 1))(o);
      },
      "minus" + d
    );
    o.reduce((s) => (o.text(s.n + ""), s));
  });

const o = E.pith((document.body = document.createElement("body")));
var state = { n: 0 };

E.bark(o)(
  E.rring((r) => {
    const newstate = r(state);
    if (newstate !== state) {
      state = newstate;
      console.info(state);
    }
  })(C())
);
Object.assign(window, { o, C, E });
