// @flow strict
import { static_cast } from "./static_cast.js";
export type P<-O> = (O) => void;
export type N<+O> = (P<O>) => void;
export type N1<+O, -B> = (P<O>, B) => void;
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
export function makeElementPith(elm: Element, depth: number = 0): P<O> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths: Array<?(O) => void> = [];
  var disposables_count = 0;
  const disposables = [];
  var prev;
  return function pith(x) {
    if (typeof x === "function") {
      console.info("P" + depth, [x], elm);
      if (prev === x) return;
      prev = x;
      x(pith, elm);
      pith();
    } else {
      console.info("P" + depth, x, elm);
      if (x == null) {
        let rez, l;
        let tmp = [];
        for (l = childNodes.length; l > childs_count; l--)
          tmp.push(elm.removeChild(childNodes[childs_count]));

        l = childPiths.length - childs_count;
        rez = childPiths.splice(childs_count, l);
        if (tmp.length || rez.length) console.log("eremove", tmp, rez);
        for (let x of rez) x && x();
        childs_count = 0;

        l = disposables.length - disposables_count;
        rez = disposables.splice(disposables_count, l);
        if (rez.length) console.log("dremove", rez);
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
              console.log("reuse" + childNodes[i].nodeName);
              console.log("reuse" + childNodes[i].nodeName + "()");
              return;
            }
            console.log("reuse" + childNodes[i].nodeName);
            console.log("create" + childNodes[i].nodeName + "()");
            const child = static_cast<Element>(childNodes[i]);
            ob = makeElementPith(child, depth + 1);
            childPiths.splice(index, 0, ob);
            ob(x.v.nar);
            return;
          }
        const child = elm.insertBefore(x.v.ctor(), childNodes[index]);
        console.log("create" + child.nodeName);
        console.log("create" + child.nodeName + "()");
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
            console.log("reuse");
            return;
          }
        console.log("create");
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
// export function ext<A: { ... }, B>(
//   key: string,
//   b: B,
//   bark: ((O<B>) => void) => void
// ): ((O<A>) => void) => void {
//   return function ring(o: (O<A>) => void) {
//     bark((x) => {
//       if (typeof x === "function") {
//         o((a) => {
//           const ob = a[key] || b;
//           const nb = x(ob);
//           if (ob === nb) return a;
//           return { ...a, [key]: nb };
//         });
//       } else if (typeof x !== "object") {
//         o(x);
//       } else if (x._ === "elm") {
//         o({ _: "elm", v: { ...x.v, nar: ext(key, b, x.v.nar) } });
//       } else if (x._ === "action") {
//         o({
//           _: "action",
//           v: {
//             ...x.v,
//             nar: (oa, elm) => ext(key, b, (o) => x.v.nar(o, elm))(oa),
//           },
//         });
//       } else {
//         o(x);
//       }
//     });
//   };
// }
