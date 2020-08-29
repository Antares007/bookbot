// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N } from "./NP";
import * as E from "./E.js";
import * as R from "./R.js";
import type { Ro, Relement } from "./R.js";

var state = { n: 0 };

const o = R.make((r) => {
  const oldstate = state;
  state = r.v(state);
  if (state !== oldstate) console.info(state);
}, (document.body = document.createElement("body")));

function button<S>(nar: N<Ro<S>>, l: MouseEventHandler): N<Relement<S>> {
  return R.element("button", function (o) {
    E.get<HTMLElement>((elm) => {
      const s = elm.style;
      s.borderRadius = "10px";
      elm.addEventListener("click", l);
      E.dispose(() => elm.removeEventListener("click", l))(o);
    })(o);
    nar(o);
  });
}
const C = (
  depth: number = 3,
  anim: boolean = false,
  init: {| n: number |} = { n: 0 }
): N<Ro<{ n: number }>> => (o) => {
  R.element(
    "div",
    function (o) {
      button(
        function (o) {
          width50percent(o);
          pstyles(anim)(o);
          E.text("+")(o);
          depth > 0 && R.map("+", init)(C(depth - 1, anim))(o);
        },
        () => action(1)
      )(o);
      button(
        function (o) {
          width50percent(o);
          mstyles(anim)(o);
          E.text("-")(o);
          depth > 0 && R.map("-", init)(C(depth - 1, anim))(o);
        },
        () => action(-1)
      )(o);
      var op;
      R.element("div", (o) => {
        op = o;
        css(o);
        R.reduce((s) => {
          E.text(s.n + "")(o);
          return s;
        })(o);
      })(o);
      const action = (n) => {
        R.reduce(function (s) {
          return { ...s, n: s.n + n };
        })(o);
        R.reduce((s) => {
          E.text(s.n + "")(op);
          E.end(op);
          return s;
        })(o);
      };
    },
    "C" + depth + anim.toString()
  )(o);
};
o((o: P<Ro<*>>) => {
  C(2)(o);
});

Object.assign(window, { o, C, E, R });

function pstyles(anim) {
  return (o) =>
    E.get<HTMLElement>((elm) => {
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
      E.dispose(() => cancelAnimationFrame(id))(o);
    })(o);
}
function mstyles(anim) {
  return (o) =>
    E.get<HTMLElement>((elm) => {
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
        elm.style.backgroundColor = `rgb(${
          Math.floor(Math.cos(t) * 30) + 100
        }, ${Math.floor(Math.sin(t) * 30) + 100}, 255)`;
        id = requestAnimationFrame(frame);
      }
      E.dispose(() => cancelAnimationFrame(id))(o);
    })(o);
}
function css(o) {
  return E.get<HTMLElement>((elm) => {
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
  })(o);
}
function width50percent(o) {
  return E.get<HTMLElement>((elm) => {
    elm.style.width = "50%";
  })(o);
}
