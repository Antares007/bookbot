// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N } from "./NP.js";
const see = static_cast<number>("");
export type Eo<S, V> =
  | Evalue<V>
  | Ereduce<S>
  | Eget
  | Eend
  | Etext
  | Eelement<S, V>
  | Edispose
  | N<Eo<S, V>>;

export type Eelement<S, V> = {| _: "Eelement", v: t<S, V> |};
export type Etext = {| _: "Etext", v: string |};
export type Eend = {| _: "Eend", v: void |};
export type Edispose = {| _: "Edispose", v: () => void |};
export type Eget = {| _: "Eget", v: (Element) => void |};
export type Evalue<+V> = {| _: "Evalue", +v: V |};
export type Ereduce<S> = {| _: "Ereduce", +v: (S) => S |};
type t<S, V> = {
  ctor: () => Element,
  eq: (Node) => boolean,
  nar: N<Eo<S, V>>,
};
export function element<S, V>(
  tag: string,
  bark: ?N<Eo<S, V>>,
  key?: string
): N<Eelement<S, V>> {
  const TAG = tag.toUpperCase();
  const vEelement = {
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
      nar: bark || ((o) => {}),
    },
  };
  return (o) => o(vEelement);
}
export function text(v: string): N<Etext> {
  const vEtext = { _: "Etext", v };
  return (o) => o(vEtext);
}
const vEend = { _: "Eend", v: void 0 };
export const end: N<Eend> = (o) => o(vEend);
export function dispose(dispose: () => void): N<Edispose> {
  const vEdispose = { _: ("Edispose": "Edispose"), v: dispose };
  return (o) => o(vEdispose);
}
export function get<T: Element>(v: (T) => void): N<Eget> {
  const vEget = { _: "Eget", v: static_cast<(Element) => void>(v) };
  return (o) => o(vEget);
}
export function value<V>(v: V): N<Evalue<V>> {
  const vEvalue = { _: "Evalue", v };
  return (o) => o(vEvalue);
}
export function reduce<S>(v: (S) => S): N<Ereduce<S>> {
  const vEreduce = { _: "Ereduce", v };
  return (o) => o(vEreduce);
}
export function make<S, V>(
  ro: P<Ereduce<S>>,
  vo: P<Evalue<V>>,
  elm: Element,
  depth: number = 0
): P<Eo<S, V>> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths: Array<?P<Eo<S, V>>> = [];
  var disposables_count = 0;
  const disposables: Array<Edispose> = [];
  var prev;
  return function pith(x) {
    if ("function" === typeof x) {
      if (prev === x) return;
      prev = x;
      x(pith);
      pith({ _: "Eend", v: void 0 });
    } else if ("Eend" === x._) {
      let rez, l;
      for (l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);
      l = childPiths.length - childs_count;
      rez = childPiths.splice(childs_count, l);
      for (let x of rez) x && x({ _: "Eend", v: void 0 });
      childs_count = 0;
      l = disposables.length - disposables_count;
      rez = disposables.splice(disposables_count, l);
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
      childPiths.splice(index, 0, () => {});
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
            return;
          }
          ob = make(ro, vo, static_cast<Element>(childNodes[i]), depth + 1);
          childPiths.splice(index, 0, ob);
          ob(x.v.nar);
          return;
        }
      const child = elm.insertBefore(x.v.ctor(), childNodes[index]);
      const ob = make(ro, vo, child, depth + 1);
      childPiths.splice(index, 0, ob);
      ob(x.v.nar);
    } else if ("Evalue" === x._) {
      vo(x);
    } else if ("Ereduce" === x._) {
      ro(x);
    } else if ("Eget" === x._) {
      x.v(elm);
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
  };
}
export function map<A: { ... }, B, V>(
  key: string,
  b: B
): (N<Eo<B, V>>) => N<Eo<A, V>> {
  return (nar) => (roa) => {
    nar(function rob(x) {
      if ("function" === typeof x) {
        map(key, b)(x)(roa);
      } else if ("Ereduce" === x._) {
        reduce((a) => {
          const { v } = x;
          const oldb = a[key] || b;
          const newb = v(oldb);
          if (oldb === newb) return a;
          return { ...a, [key]: newb };
        })(roa);
      } else if ("Eelement" === x._) {
        const { v } = x;
        roa({ ...x, v: { ...v, nar: map(key, b)(v.nar) } });
      } else {
        roa(x);
      }
    });
  };
}
