// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N, N1 } from "./NP.js";

export type Eo = Eend | Etext | Eelement | Edispose | N1<Eo, Element>;

export type Eend = {| _: "Eend", v: void |};
export type Etext = {| _: "Etext", v: string |};
export type Eelement = {| _: "Eelement", v: t |};
export type Edispose = {| _: "Edispose", v: () => void |};
type t = {
  ctor: () => Element,
  eq: (Node) => boolean,
  nar: N1<Eo, Element>,
};

export function end(): N<Eend> {
  return (o) => o({ _: "Eend", v: void 0 });
}
export function text(v: string): N<Etext> {
  const Etext = { _: "Etext", v };
  return (o) => o(Etext);
}
export function element(
  tag: string,
  bark: ?N1<Eo, Element>,
  key?: string
): N<Eelement> {
  const TAG = tag.toUpperCase();
  const elm = {
    _: "Eelement",
    v: {
      ctor: () => {
        const elm = document.createElement(TAG);
        if (key) elm.setAttribute("key", key);
        return elm;
      },
      eq: (n) =>
        n instanceof HTMLElement &&
        n.nodeName === TAG &&
        (!key || n.getAttribute("key") === key),
      nar: bark || empty,
    },
  };
  return (o) => o(elm);
}
export function dispose(dispose: () => void): N<Edispose> {
  const d = { _: ("Edispose": "Edispose"), v: dispose };
  return (o) => o(d);
}
export function make(elm: Element, depth: number = 0): P<Eo> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths: Array<?(Eo) => void> = [];
  var disposables_count = 0;
  const disposables: Array<Edispose> = [];
  var prev;
  return function pith(x) {
    if (typeof x === "function") {
      log("P" + depth, x, elm);
      if (prev === x) return;
      prev = x;
      x(pith, elm);
      end()(pith);
    } else {
      log("P" + depth, x, elm);
      if ("Eend" === x._) {
        let rez, l;
        let tmp = [];
        for (l = childNodes.length; l > childs_count; l--)
          tmp.push(elm.removeChild(childNodes[childs_count]));

        l = childPiths.length - childs_count;
        rez = childPiths.splice(childs_count, l);
        if (tmp.length || rez.length) log("eremove", tmp, rez);
        for (let x of rez) x && end()(x);
        childs_count = 0;

        l = disposables.length - disposables_count;
        rez = disposables.splice(disposables_count, l);
        if (rez.length) log("dremove", rez);
        for (let x of rez) x.v();
        disposables_count = 0;
      } else if ("Etext" === x._) {
        const index = childs_count++;
        const l = childNodes.length;
        for (let i = index; i < l; i++)
          if (childNodes[i].nodeType === 3 && childNodes[i].textContent === x) {
            if (index < i) {
              elm.insertBefore(childNodes[i], childNodes[index]);
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
            }
            return;
          }
        elm.insertBefore(document.createTextNode(x.v), childNodes[index]);
        childPiths.splice(index, 0, empty);
      } else if ("Eelement" === x._) {
        const index = childs_count++;
        const l = childNodes.length;
        for (let i = index; i < l; i++)
          if (x.v.eq(childNodes[i])) {
            if (index < i) {
              elm.insertBefore(childNodes[i], childNodes[index]);
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
            }
            let ob = childPiths[index];
            if (ob) {
              log("reuse" + childNodes[i].nodeName);
              log("reuse" + childNodes[i].nodeName + "()");
              return;
            }
            log("reuse" + childNodes[i].nodeName);
            log("create" + childNodes[i].nodeName + "()");
            ob = make(static_cast<Element>(childNodes[i]), depth + 1);
            childPiths.splice(index, 0, ob);
            ob(x.v.nar);
            return;
          }
        const child = elm.insertBefore(x.v.ctor(), childNodes[index]);
        log("create" + child.nodeName);
        log("create" + child.nodeName + "()");
        const ob = make(child, depth + 1);
        childPiths.splice(index, 0, ob);
        ob(x.v.nar);
      } else {
        const index = disposables_count++;
        const l = disposables.length;
        for (let i = index; i < l; i++)
          if (disposables[i] === x) {
            if (index < i) {
              disposables.splice(index, 0, ...disposables.splice(i, 1));
            }
            log("reuse");
            return;
          }
        log("create");
        disposables.splice(index, 0, x);
      }
    }
  };
}
function empty(o) {}
function log(...a) {
  // console.info(...a);
}
