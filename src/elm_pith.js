// @flow strict
import { static_cast } from "./static_cast.js";

export type O =
  | void
  | string
  | Oelm
  | Odispose
  | (((O) => void, Element) => void);
export opaque type Oelm = {|
  _: "elm",
  v: {
    ctor: () => Element,
    eq: (Node) => boolean,
    nar: ((O) => void, Element) => void,
  },
|};
export opaque type Odispose = {| _: "dispose", v: () => void |};

export function empty<T>(_: T) {}
export function makeElementPith(elm: Element, depth: number = 0): (O) => void {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  var disposables_count = 0;
  const disposables = [];
  return function pith(x) {
    if (typeof x === "function") {
      console.info("P" + depth, [x], elm);
      x(pith, elm);
      pith();
    } else {
      console.info("P" + depth, x, elm);
      if (x == null) {
        let rez, l;
        let tmp = [];
        for (l = childNodes.length; l > childs_count; l--)
          tmp.push(elm.removeChild(childNodes[childs_count]));
        if (tmp.length) console.log("remove", tmp);

        l = childPiths.length - childs_count;
        rez = childPiths.splice(childs_count, l);
        for (let x of rez) x();
        childs_count = 0;

        l = disposables.length - disposables_count;
        rez = disposables.splice(disposables_count, l);
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
            console.log("reuse");
            childPiths[index](x.v.nar);
            return;
          }
        console.log("create");
        const child = elm.insertBefore(x.v.ctor(), childNodes[index]);
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
            return;
          }
        disposables.splice(index, 0, x);
      }
    }
  };
}
export function element(
  tag: string,
  bark: ?((O) => void, Element) => void
): ((Oelm) => void) => void {
  const TAG = tag.toUpperCase();
  const elm = {
    _: "elm",
    v: {
      ctor: () => document.createElement(TAG),
      eq: (n) => n instanceof HTMLElement && n.nodeName === TAG,
      nar: bark || (() => {}),
    },
  };
  return (o) => o(elm);
}
export function dispose(dispose: () => void): ((Odispose) => void) => void {
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
