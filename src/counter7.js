// @flow strict
import * as E from "./elm_pith";
const { dispose, action, elm, ext, makeElementPith } = E;
function act<S, A>(
  name: string,
  b: ((E.O<S, A>) => void, Element, Event) => void
): E.Oaction<S, A> {
  var t;
  const d = dispose(() => {
    if (t) {
      console.log("d", t.l);
      t.elm.removeEventListener(name, t.l);
      t = null;
    }
  });
  const a = action((o, elm) => {
    t = {
      elm,
      l: (e: Event) => {
        b.call(this, o, elm, e);
      },
    };
    elm.addEventListener(name, t.l);
    o(d);
  });
  return a;
}
function counter(o, depth = 0): void {
  const a = act("click", (o, elm, e) => {
    o(E.a(1));
  });
  const b = act("click", (o, elm, e) => {
    o(E.a(-1));
  });
  const p = () => rec(o, depth);
  const on_ = E.on((o, a) => {
    o(function ({ n }) {
      return { n: n + a };
    });
    p();
  });
  p();
  function rec(o, d) {
    o(on_);
    o(
      elm("button", (o) => {
        o("+");
        o(a);
        if (d > 0)
          o(
            elm(
              "div",
              ext("+", { n: 0 }, (o) => rec(o, d - 1))
            )
          );
        o();
      })
    );
    o(
      elm("button", (o) => {
        o("-");
        o(b);
        if (d > 0)
          o(
            elm(
              "div",
              ext("-", { n: 0 }, (o) => rec(o, d - 1))
            )
          );
        o();
      })
    );
    o(function (s) {
      o(s.n + "");
      return s;
    });
    o();
  }
  function r_add1(s) {
    return { n: s.n + 1 };
  }
  function r_minus1(s) {
    return { n: s.n - 1 };
  }
}
const root = (document.body = document.createElement("body"));

var state = { n: 369 };

const o = makeElementPith<{| n: number |}, *>((r) => {
  if (typeof r === "function") {
    console.info("S", [r]);
    state = r(state);
  } else {
    console.info("A", r.a);
  }
}, root);

counter(o);

Object.assign(window, {
  o,
  elm,
  dispose,
  makeElementPith,
  c: counter,
});
