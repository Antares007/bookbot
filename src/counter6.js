// @flow strict
import * as E from "./elm_pith";

const elm = (tag, bark, key: ?string) => {
  const ctor = () => document.createElement(tag);
  const eq = (n) => (n instanceof HTMLElement && n.nodeName === tag ? n : null);
  return key
    ? {
        _: "elm",
        ctor: () => {
          const n = ctor();
          n.id = key;
          return n;
        },
        eq: (n) => {
          const nn = eq(n);
          return nn && nn.id === key ? nn : null;
        },
        bark,
      }
    : { _: "elm", ctor, eq, bark };
};

function empty(_) {}

function counter(o, d = 1) {
  o(
    elm("button", (o) => {
      o("+");
      if (d > 0) o(elm("div", (o) => counter(o, d - 1)));
    })
  );
  o(
    elm("button", (o) => {
      o("-");
      if (d > 0) o(elm("div", (o) => counter(o, d - 1)));
    })
  );
  o("0");
  o({ _: "reduce", r: (s) => s });
}

const root = document.querySelector("#root-node");
if (!root) throw new Error("root");

var state = { n: 0 };
const ob = E.sc((r) => {
  state = r(state);
}, E.create(root));

counter(ob);
counter(ob);
ob();
counter(ob);
ob();
