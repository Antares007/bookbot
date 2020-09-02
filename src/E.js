// @flow strict
import type { P, N } from "./NP.js";
export type o_t<S, V> =
  | value_t<V>
  | reduce_t<S>
  | action_t
  | end_t
  | string_t
  | element_t<S, V>;
export type string_t = {| t: "string", v: string |};
export type end_t = {| t: "end", v?: void |};
export type action_t = {| t: "action", v: (Element) => ?() => void |};
export type value_t<+V> = {| t: "value", +v: V |};
export type reduce_t<S> = {| t: "reduce", +v: (S) => S |};
export type element_t<S, V> = {|
  t: "element",
  v: { sel: string, nar?: ?N<o_t<S, V>>, key?: ?string },
|};
export function make<S, V>(
  ro: P<reduce_t<S>>,
  vo: P<value_t<V>>,
  elm: Element,
  depth: number = 0
): P<o_t<S, V>> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths: Array<?P<o_t<S, V>>> = [];
  var actions_count = 0;
  const actions: Array<[action_t, ?() => void]> = [];
  var prev;
  return function pith(x) {
    if ("element" === x.t) {
      const index = childs_count++;
      const l = childNodes.length;
      const { tag, classList, id } = parseSelector(x.v.sel);
      const nar = x.v.nar;
      const key = x.v.key;
      var n;
      for (let i = index; i < l; i++)
        if (
          (n = childNodes[i]) &&
          n instanceof HTMLElement &&
          n.nodeName === tag &&
          (!key || n.getAttribute("key") === key)
        ) {
          if (index < i) {
            elm.insertBefore(n, childNodes[index]);
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          let ob = childPiths[index];
          if (ob) {
            if (key) return;
            nar && nar(ob);
            ob({ t: "end", v: void 0 });
            return;
          }
          ob = make(ro, vo, n, depth + 1);
          childPiths.splice(index, 0, ob);
          nar && nar(ob);
          ob({ t: "end", v: void 0 });
          return;
        }
      const child = elm.insertBefore(
        document.createElement(tag),
        childNodes[index]
      );
      if (key) child.setAttribute("key", key);
      const ob = make(ro, vo, child, depth + 1);
      childPiths.splice(index, 0, ob);
      nar && nar(ob);
      ob({ t: "end", v: void 0 });
    } else if ("string" === x.t) {
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
    } else if ("reduce" === x.t) {
      ro(x);
    } else if ("value" === x.t) {
      vo(x);
    } else if ("action" === x.t) {
      const index = actions_count++;
      const l = actions.length;
      for (let i = index; i < l; i++)
        if (actions[i][0] === x) {
          if (index < i) {
            actions.splice(index, 0, ...actions.splice(i, 1));
          }
          return;
        }
      actions.splice(index, 0, [x, x.v(elm)]);
    } else if ("end" === x.t) {
      let rez, l;
      for (l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);

      l = childPiths.length - childs_count;
      rez = childPiths.splice(childs_count, l);
      childs_count = 0;
      for (let x of rez) x && x({ t: "end", v: void 0 });

      l = actions.length - actions_count;
      rez = actions.splice(actions_count, l);
      actions_count = 0;
      for (let [x, d] of rez) d && d();
    } else {
      throw new Error("undefined o");
    }
  };
}
export function mmap<A, B>(f: (A) => B): (?A) => ?B {
  return (x) => (x ? f(x) : null);
}
export function rmap<A: { ... }, B, V>(
  key: string,
  b: B
): (N<o_t<B, V>>) => N<o_t<A, V>> {
  return (nar) => (o) => {
    nar(function rmap_pith(x) {
      if ("reduce" === x.t) {
        o({
          t: "reduce",
          v: (a) => {
            const oldb = a[key] || b;
            const newb = x.v(oldb);
            if (oldb === newb) return a;
            return { ...a, [key]: newb };
          },
        });
      } else if ("element" === x.t) {
        o({ ...x, v: { ...x.v, nar: mmap(rmap(key, b))(x.v.nar) } });
      } else {
        o(x);
      }
    });
  };
}
function hashString(s) {
  for (var i = 0, h = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
function parseSelector(sel) {
  const classList = [];
  const l = sel.length;
  var tag = "";
  var i = 0;
  var id;
  var tmp;
  while (i < l && sel[i] !== "." && sel[i] !== "#") tag += sel[i++];
  tag = tag.length ? tag.toUpperCase() : "DIV";
  while (i < l) {
    tmp = "";
    if (sel[i] === ".") {
      while (++i < l && sel[i] !== "." && sel[i] !== "#") tmp += sel[i];
      if (tmp.length) classList.push(tmp);
    } else if (sel[i] === "#") {
      while (++i < l && sel[i] !== "." && sel[i] !== "#") tmp += sel[i];
      if (tmp.length) id = tmp;
    }
  }
  return { tag, classList, id };
}
