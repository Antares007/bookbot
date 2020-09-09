// @flow strict
import * as E from "./E3";
import { static_cast } from "./static_cast";

const T = () => (o) =>
  o.element("div", (o) => {
    var b, b2, b3;
    o.on("input", (e) => {
      const t = static_cast<HTMLInputElement>(e.target);
      o.reduce((s) => {
        return { ...s, text: t.value };
      });
      b3();
    });
    o.element(
      "input",
      (b2 = bark((o) => {
        o.reduce((s) => {
          o.prop("value", s.text);
          return s;
        });
      }))
    );

    o.element("span", (o) => {
      o.on("click", () => {
        o.reduce((s) => {
          return { ...s, text: "", list: [...s.list, s.text] };
        });
        b();
        b2();
      });
      o.element(
        "button",
        (b3 = bark((o) => {
          o.text("add");
          o.reduce((s) => {
            console.log(s.text);
            o.attr("disabled", s.text ? null : "");
            return s;
          });
        }))
      );
    });

    o.element(
      "div",
      (b = bark((o) => {
        o.reduce((s) => {
          o.element("ul", (o) => {
            for (let str of s.list) {
              o.element("li", (o) => o.text(str));
            }
          });
          return s;
        });
      }))
    );

    o.text("ok");
  });

const o = E.pith((document.body = document.createElement("body")));
var state = { n: 0, text: "init value", list: [] };

E.bark(o)(
  E.rring((r) => {
    const newstate = r(state);
    if (newstate !== state) {
      state = newstate;
      console.info(state);
    }
  })(props(T()))
);
Object.assign(window, { o, T, E });

function bark(nar) {
  var op;
  return function b(x) {
    if (x == null) {
      if (op) nar(op), op.end();
    } else {
      op = x;
      nar(op);
    }
  };
}
function props(nar) {
  return (o) => {
    const p = {
      ...o,
      element(sel, nar, key) {
        o.element(sel, props(nar), key);
      },
      prop(name: string, value: mixed) {
        o.get((elm) => {
          static_cast<{ [string]: mixed }>(elm)[name] = value;
        });
      },
    };
    nar(p);
  };
}
