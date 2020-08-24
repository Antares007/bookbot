// @flow strict
import { static_cast } from "./static_cast.js";
export type P<-O> = (O) => void;
export type N<+O> = (P<O>) => void;
export type N1<+O, -B> = (P<O>, B) => void;
export function cb<O, T>(
  f: (O | T) => boolean,
  cb: (T) => void
): (P<O>) => P<O | T> {
  return (o) => (x) => {
    f(x) ? cb(static_cast<T>(x)) : o(static_cast<O>(x));
  };
}
export function cbn<O>(cb: (number) => void): (P<O>) => P<O | number> {
  return (o) => (x) => {
    typeof x === "number" ? cb(x) : o(static_cast<O>(x));
  };
}
export type O = void | string | Oelm | Odispose | N1<O, Element>;
export opaque type Oelm = {|
  _: "elm",
  v: {
    ctor: () => Element,
    eq: (Node) => boolean,
    nar: N1<O, Element>,
  },
|};
export opaque type Odispose = {| _: "dispose", v: () => void |};
function empty(o) {}
const log = console.info.bind(console); //(...a) => {}; //
export function makeElementPith(elm: Element, depth: number = 0): P<O> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths: Array<?(O) => void> = [];
  var disposables_count = 0;
  const disposables = [];
  var prev;
  return function pith(x) {
    if (typeof x === "function") {
      log("P" + depth, [x], elm);
      if (prev === x) return;
      prev = x;
      x(pith, elm);
      pith();
    } else {
      log("P" + depth, x, elm);
      if (x == null) {
        let rez, l;
        let tmp = [];
        for (l = childNodes.length; l > childs_count; l--)
          tmp.push(elm.removeChild(childNodes[childs_count]));

        l = childPiths.length - childs_count;
        rez = childPiths.splice(childs_count, l);
        if (tmp.length || rez.length) log("eremove", tmp, rez);
        for (let x of rez) x && x();
        childs_count = 0;

        l = disposables.length - disposables_count;
        rez = disposables.splice(disposables_count, l);
        if (rez.length) log("dremove", rez);
        for (let x of rez) x.v();
        disposables_count = 0;
      } else if (typeof x === "string") {
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
        elm.insertBefore(document.createTextNode(x), childNodes[index]);
        childPiths.splice(index, 0, empty);
      } else if (x._ === "elm") {
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
            const child = static_cast<Element>(childNodes[i]);
            ob = makeElementPith(child, depth + 1);
            childPiths.splice(index, 0, ob);
            ob(x.v.nar);
            return;
          }
        const child = elm.insertBefore(x.v.ctor(), childNodes[index]);
        log("create" + child.nodeName);
        log("create" + child.nodeName + "()");
        const ob = makeElementPith(child, depth + 1);
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
export function element(
  tag: string,
  bark: ?N1<O, Element>,
  key?: string
): N<Oelm> {
  const TAG = tag.toUpperCase();
  const elm = {
    _: "elm",
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
export function dispose(dispose: () => void): N<Odispose> {
  const d = { _: ("dispose": "dispose"), v: dispose };
  return (o) => o(d);
}
