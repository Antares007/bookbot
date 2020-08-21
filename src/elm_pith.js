// @flow strict
import { static_cast } from "./static_cast.js";
export opaque type Oaction = {|
  _: "action",
  v: { nar: ((O) => void, Element) => void, dispose: () => void },
|};
export opaque type Oelm = {|
  _: "elm",
  v: {
    ctor: () => Element,
    eq: (Node) => ?Element,
    nar: ((O) => void) => void,
  },
|};
export opaque type Odispose = {| _: "dispose", v: () => void |};
export type O = void | string | Oelm | Oaction | Odispose;
export function empty<T>(_: T) {}
export function makeElementPith(elm: Element, depth: number = 0): (O) => void {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  var actions_count = 0;
  const actions = [];
  var disposables_count = 0;
  const disposables = [];
  return function pith(x) {
    if (typeof x === "function") {
      console.info("P" + depth, [x], elm);
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

        l = actions.length - actions_count;
        rez = actions.splice(actions_count, l);
        if (rez.length) console.log("remove", rez);
        for (let x of rez) x.v.dispose();
        actions_count = 0;
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
            x.v.nar(childPiths[index]);
            return;
          }
        console.log("create");
        const child = elm.insertBefore(x.v.ctor(), childNodes[index]);
        const ob = makeElementPith(child, depth + 1);
        childPiths.splice(index, 0, ob);
        x.v.nar(ob);
      } else if (x._ === "action") {
        const index = actions_count++;
        const l = actions.length;
        for (let i = index; i < l; i++)
          if (actions[i] === x) {
            if (index < i) {
              actions.splice(index, 0, ...actions.splice(i, 1));
            }
            console.log("reuse");
            return;
          }
        console.log("create");
        actions.splice(index, 0, x);
        x.v.nar(pith, elm);
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
export function elm(tag: string, bark: ?((O) => void) => void): Oelm {
  const TAG = tag.toUpperCase();
  return {
    _: "elm",
    v: {
      ctor: () => document.createElement(TAG),
      eq: (n) => (n instanceof HTMLElement && n.nodeName === TAG ? n : null),
      nar: bark || (() => {}),
    },
  };
}
export function action(a: ((O) => void, Element) => ?() => void): Oaction {
  var d;
  return {
    _: ("action": "action"),
    v: {
      nar: (o, elm) => {
        d = a(o, elm);
      },
      dispose: () => {
        if (d) {
          d();
          d = null;
        }
      },
    },
  };
}
export function dispose(dispose: () => void): Odispose {
  return { _: ("dispose": "dispose"), v: dispose };
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
