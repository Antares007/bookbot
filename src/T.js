// @flow strict
import * as E from "./E3";
import { static_cast } from "./static_cast";

const T = () => (o) =>
  o.element("div", function nar(o) {
    const b = E.bark(o);
    o.element("input", (o) => {
      o.on("input", (e) => {
        const t = static_cast<HTMLInputElement>(e.target);
        o.reduce((s) => ({ ...s, text: t.value }));
        b(nar);
      });
      o.reduce((s) => (o.prop("value", s.text), s));
    });
    o.element("button", (o) => {
      o.on("click", () => {
        o.reduce((s) => ({ ...s, text: "", list: [...s.list, s.text] }));
        b(nar);
      });
      o.text("add");
      o.reduce((s) => (o.attr("disabled", s.text ? null : ""), s));
    });
    o.element("div", (o) => {
      o.reduce((s) => {
        o.element("ul", (o) => {
          s.list.forEach((str, i) => {
            o.element("li", (o) => {
              o.element("button", (o) => {
                o.on("click", (e) => {
                  o.reduce((s) => {
                    return {
                      ...s,
                      text: s.list[i],
                      list: s.list.filter((s, si) => si !== i),
                    };
                  });
                  b(nar);
                });
                o.text("x");
              });
              o.text(str);
            });
          });
        });
        return s;
      });
    });
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
