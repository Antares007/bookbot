// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N } from "./NP";
import * as E from "./E.js";
import * as R from "./R.js";
import type { Ro, Relement } from "./R.js";

var state = { n: 99, "+": { n: 33 }, "-": { n: 66 } };

const o = R.make((r) => {
  const oldstate = state;
  state = r.v(state);
  if (state !== oldstate) console.info(state);
}, (document.body = document.createElement("body")));
const width50percent = E.get((elm) => {
  static_cast<HTMLElement>(elm).style.width = "50%";
});
const css = E.get((elm) => {
  const s = static_cast<HTMLElement>(elm).style;
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
const button = <S>(nar: N<Ro<S>>, l: MouseEventHandler): N<Relement<S>> =>
  R.element("button", function (o) {
    E.get((elm) => {
      const s = static_cast<HTMLElement>(elm).style;
      s.borderRadius = "10px";
      elm.addEventListener("click", l);
      E.dispose(() => elm.removeEventListener("click", l))(o);
    })(o);
    nar(o);
  });
const C = (
  depth: number = 0,
  init: {| n: number |} = { n: 0 }
): N<Ro<{ n: number }>> => (o) => {
  R.element(
    "div",
    function (o) {
      var op;
      const l = (n) =>
        R.reduce((s) => {
          const ns = { ...s, n: s.n + n };
          E.text(ns.n + "")(op);
          E.end(op);
          return ns;
        })(op);

      button(
        function (o) {
          width50percent(o);
          E.text("+")(o);
          depth > 0 && R.map("+", init)(C(depth - 1))(o);
        },
        () => l(1)
      )(o);
      button(
        function (o) {
          width50percent(o);
          const anim = (i) =>
            E.get<HTMLElement>((elm) => {
              elm.style.position = "relative";
              elm.style.left = i + "px";
              elm.style.fontSize = "8px";
            })(o);
          anim(0);
          var id = requestAnimationFrame(function frame(t) {
            anim(Math.sin(t) * 10);
            id = requestAnimationFrame(frame);
          });
          E.dispose(() => cancelAnimationFrame(id))(o);
          E.text("-")(o);
          depth > 0 && R.map("-", init)(C(depth - 1))(o);
        },
        () => l(-1)
      )(o);
      R.element("div", (o) => {
        css(o);
        R.reduce((s) => {
          op = o;
          E.text(s.n + "")(o);
          return s;
        })(o);
      })(o);
    },
    "C" + depth
  )(o);
};

o(C());

Object.assign(window, { o, C, E, R });
