// @flow strict
import type { P, N } from "./NP.js";

export type o_t = action_t | end_t | text_t | element_t;

export type text_t = {| t: "text", v: string |};
export type end_t = {| t: "end", v?: void |};
export type action_t = {| t: "action", v: (Element) => N<o_t | disposable_t> |};
export type element_t = {| t: "element", v: element_v_t |};
export type disposable_t = {| t: "disposable", v: () => void |};
type element_v_t = {| sel: string, nar: N<o_t>, key?: ?string |};

export const end: end_t = { t: "end" };
export function element<T>(
  pmap: (T) => N<o_t>
): (string, T, ?string) => element_t {
  return (sel, t, key) => {
    return { t: "element", v: { sel, nar: pmap(t), key } };
  };
}
export function text(v: string): text_t {
  return { t: "text", v };
}
export function action(v: (Element) => N<o_t | disposable_t>): action_t {
  return { t: "action", v };
}
export function disposable(v: () => void): disposable_t {
  return { t: "disposable", v };
}
export function make(elm: Element, depth: number = 0): P<o_t> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  var actions_count = 0;
  const actions = [];
  return function pith(r) {
    if ("element" === r.t) {
      var n, ob;
      const index = childs_count++;
      const { sel, nar, key } = r.v;
      const { tag, classList, id } = parseSelector(sel);
      for (let i = index, l = childNodes.length; i < l; i++)
        if (
          (n = childNodes[i]) &&
          n instanceof HTMLElement &&
          n.nodeName === tag &&
          classList.every(n.classList.contains.bind(n.classList)) &&
          (!id || n.id === id) &&
          (!key || n.getAttribute("key") === key)
        ) {
          if (index < i)
            elm.insertBefore(n, childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));

          if ((ob = childPiths[index]))
            if (key) return;
            else return nar(ob), ob({ t: "end" });
          childPiths.splice(index, 0, (ob = make(n, depth + 1)));
          return nar(ob), ob({ t: "end" });
        }
      n = document.createElement(tag);
      if (key) n.setAttribute("key", key);
      if (id) n.id = id;
      for (let str of classList) n.classList.add(str);
      elm.insertBefore(n, childNodes[index]),
        childPiths.splice(index, 0, (ob = make(n, depth + 1)));
      nar(ob), ob({ t: "end" });
    } else if ("text" === r.t) {
      const index = childs_count++;
      const text = r.v;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (
          childNodes[i].nodeType === 3 &&
          childNodes[i].textContent === text
        ) {
          if (index < i)
            elm.insertBefore(childNodes[i], childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          return;
        }
      elm.insertBefore(document.createTextNode(text), childNodes[index]),
        childPiths.splice(index, 0, null);
    } else if ("action" === r.t) {
      const index = actions_count++;
      const a = r.v;
      for (let i = index, l = actions.length; i < l; i++)
        if (actions[i][0] === a) {
          if (index < i) actions.splice(index, 0, ...actions.splice(i, 1));
          return;
        }
      const disposables = [];
      actions.splice(index, 0, [a, disposables]);
      a(elm)((r) => {
        if ("disposable" === r.t) disposables.push(r);
        else pith(r);
      });
    } else if ("end" === r.t) {
      for (let l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);
      const piths = childPiths.splice(
        childs_count,
        childPiths.length - childs_count
      );
      childs_count = 0;
      const acts = actions.splice(
        actions_count,
        actions.length - actions_count
      );
      actions_count = 0;
      for (let mp of piths) mp && mp({ t: "end" });
      for (let [_, disposables] of acts) for (let d of disposables) d.v();
    } else throw new Error("invalid rvalue: " + JSON.stringify(r));
  };
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
      while (++i < l && sel[i] !== "." && sel[i] !== "#") tmp += sel[i];
      if (tmp.length) classList.push(tmp);
    } else if (sel[i] === "#") {
      while (++i < l && sel[i] !== "." && sel[i] !== "#") tmp += sel[i];
      if (tmp.length) id = tmp;
    }
  }
  return { tag, classList, id };
}
//function hashString(s: string): number {
//  for (var i = 0, h = 0; i < s.length; i++)
//    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
//  return h;
//}
