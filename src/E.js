// @flow strict
import type { P, N } from "./NP.js";

export type o_t = action_t | end_t | string_t | element_t;

export type string_t = {| t: "text", v: string |};
export type end_t = {| t: "end", v?: void |};
export type action_t = {| t: "action", v: (Element) => ?() => void |};
export type element_t = {| t: "element", v: t0_t |};

type t0_t = {| sel: string, nar: N<o_t>, key?: ?string |};

export const end: end_t = { t: "end" };
export function element<T>(
  pmap: (T) => N<o_t>
): (string, T, ?string) => element_t {
  return (sel, t, key) => {
    return { t: "element", v: { sel, nar: pmap(t), key } };
  };
}
export function text(v: string): string_t {
  return { t: "text", v };
}
export function action(v: (Element) => ?() => void): action_t {
  return { t: "action", v };
}
export function make(elm: Element, depth: number = 0): P<o_t> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths: Array<?P<o_t>> = [];
  var actions_count = 0;
  const actions: Array<[action_t, ?() => void]> = [];
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
          classList.every(n.classList.contains.bind(n.classList)) &&
          (!id || n.id === id) &&
          (!key || n.getAttribute("key") === key)
        ) {
          if (index < i) {
            elm.insertBefore(n, childNodes[index]);
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          let ob = childPiths[index];
          if (ob) {
            if (key) return;
            nar(ob);
            ob({ t: "end" });
            return;
          }
          ob = make(n, depth + 1);
          childPiths.splice(index, 0, ob);
          nar(ob);
          ob({ t: "end" });
          return;
        }
      const child = document.createElement(tag);
      if (key) child.setAttribute("key", key);
      if (id) child.id = id;
      for (let str of classList) child.classList.add(str);
      elm.insertBefore(child, childNodes[index]);
      const ob = make(child, depth + 1);
      childPiths.splice(index, 0, ob);
      nar(ob);
      ob({ t: "end" });
    } else if ("text" === x.t) {
      const index = childs_count++;
      const l = childNodes.length;
      for (let i = index; i < l; i++)
        if (childNodes[i].nodeType === 3 && childNodes[i].textContent === x.v) {
          if (index < i) {
            elm.insertBefore(childNodes[i], childNodes[index]);
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          return;
        }
      elm.insertBefore(document.createTextNode(x.v), childNodes[index]);
      childPiths.splice(index, 0, null);
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
      for (let x of rez) x && x({ t: "end" });

      l = actions.length - actions_count;
      rez = actions.splice(actions_count, l);
      actions_count = 0;
      for (let [x, d] of rez) d && d();
    } else {
      throw new Error("undefined o");
    }
  };
}
function hashString(s: string): number {
  for (var i = 0, h = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
function parseSelector(
  sel: string
): {| tag: string, classList: Array<string>, id: ?string |} {
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
      while (++i < l && sel[i] !== "." && sel[i] !== "#") {
        let see: string = sel[i];
        tmp += see;
      }
      if (tmp.length) classList.push(tmp);
    } else if (sel[i] === "#") {
      while (++i < l && sel[i] !== "." && sel[i] !== "#") tmp += sel[i];
      if (tmp.length) id = tmp;
    }
  }
  return { tag, classList, id };
}
