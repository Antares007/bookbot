// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N } from "./NP";
import * as E from "./E.js";

const end = { _: "Eend" };
function element(tag, nar, key) {
  return { _: "Eelement", v: { tag, nar, key } };
}
function text(v) {
  return { _: "Etext", v };
}
function dispose(v) {
  return { _: "Edispose", v };
}
function get(v) {
  return { _: "Eget", v };
}
function value(v) {
  return { _: "Evalue", v };
}
function reduce(v) {
  return { _: "Ereduce", v };
}
var state = { n: 0 };

const o = E.make(
  (r) => {
    const oldstate = state;
    state = r.v(state);
    if (state !== oldstate) console.info(state);
  },
  (v) => console.log(v),
  (document.body = document.createElement("body"))
);

function button(nar, l) {
  return element("button", function (o) {
    o(
      get((elm) => {
        if (!(elm instanceof HTMLElement)) return;
        const s = elm.style;
        s.borderRadius = "10px";
        elm.addEventListener("click", l);
        o(dispose(() => elm.removeEventListener("click", l)));
      })
    );
    nar(o);
  });
}
function style(f) {
  return get((elm) => {
    if (elm instanceof HTMLElement) f(elm.style);
  });
}
const api = (nar) => (o) => {
  nar((x) => {
    if ("string" === typeof x) {
      o({ _: "Etext", v: x });
    } else if ("number" === typeof x) {
      o({ _: "Etext", v: x + "" });
    } else if ("Eelement" === x._) {
      o({ _: "Eelement", v: { ...x.v, nar: E.mmap(api)(x.v.nar) } });
    } else o(x);
  });
};

const C = (
  depth: number = 3,
  anim: boolean = false,
  init: {| n: number |} = { n: 0 }
) => (o) => {
  o(
    element(
      "div",
      api(function pith(o) {
        o(
          button(
            function (o) {
              o(width50percent());
              o(pstyles(anim));
              o(text("+"));
              depth > 0 && E.rmap("+", init)(C(depth - 1, anim))(o);
            },
            () => action(1)
          )
        );
        o(
          button(
            function (o) {
              o(width50percent());
              o(mstyles(anim));
              o(text("-"));
              depth > 0 && E.rmap("-", init)(C(depth - 1, anim))(o);
            },
            () => action(-1)
          )
        );
        var op;
        o(
          element("div", (o) => {
            op = o;
            o(css());
            o(
              reduce((s) => {
                o(text(s.n + ""));
                return s;
              })
            );
          })
        );
        const action = (n) => {
          o(
            reduce(function (s) {
              return { ...s, n: s.n + n };
            })
          );
          o(
            reduce((s) => {
              op(text(s.n + ""));
              op(end);
              return s;
            })
          );
        };
      }),
      "C" + depth + anim.toString()
    )
  );
};
C(2)(o);
o(end);

Object.assign(window, { o, C, E });

function pstyles(anim) {
  return get((elm) => {
    if (!(elm instanceof HTMLElement)) return;
    elm.style.position = "relative";
    elm.style.fontSize = "18px";
    var id = requestAnimationFrame(frame);
    var t = 0;
    function frame() {
      t = t > 6.28 ? 0 : t + 0.1;
      elm.style.borderRadius = Math.abs(Math.floor(Math.sin(t) * 10)) + "px";
      if (anim) {
        elm.style.left = Math.floor(Math.cos(t) * 10) + "px";
        elm.style.top = Math.floor(Math.sin(t) * 10) + "px";
      }
      elm.style.backgroundColor = `rgb(255, ${
        Math.floor(Math.cos(t) * 30) + 100
      }, ${Math.floor(Math.sin(t) * 30) + 100})`;
      id = requestAnimationFrame(frame);
    }
    o(dispose(() => cancelAnimationFrame(id)));
  });
}
function mstyles(anim) {
  return get((elm) => {
    if (!(elm instanceof HTMLElement)) return;
    elm.style.position = "relative";
    elm.style.fontSize = "18px";
    var id = requestAnimationFrame(frame);
    var t = 0;
    function frame() {
      t = t > 6.28 ? 0 : t + 0.1;
      elm.style.borderRadius = Math.abs(Math.floor(Math.sin(t) * 10)) + "px";
      if (anim) {
        elm.style.left = Math.floor(Math.sin(t) * 10) + "px";
        elm.style.top = Math.floor(Math.cos(t) * 10) + "px";
      }
      elm.style.backgroundColor = `rgb(${Math.floor(Math.cos(t) * 30) + 100}, ${
        Math.floor(Math.sin(t) * 30) + 100
      }, 255)`;
      id = requestAnimationFrame(frame);
    }
    o(dispose(() => cancelAnimationFrame(id)));
  });
}
function css() {
  return get((elm) => {
    if (!(elm instanceof HTMLElement)) return;
    const s = elm.style;
    s.width = "50%";
    s.height = "1.5em";
    s.backgroundColor = "black";
    s.color = "white";
    s.marginLeft = "auto";
    s.marginRight = "auto";
    s.textAlign = "center";
    s.borderRadius = "10px";
    s.marginTop = "10px";
    s.marginBottom = "10px";
  });
}
function width50percent() {
  return get((elm) => {
    if (!(elm instanceof HTMLElement)) return;
    elm.style.width = "50%";
  });
}
