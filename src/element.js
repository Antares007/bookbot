// @flow strict
import type { N } from "./purry";
export type o_pith_t = {
  text: N<string>,
  element: N<string, (o_pith_t) => void, ?string>,
  attr: N<string, ?string>,
  style: N<string, ?string>,
  prop: N<string, mixed>,
  on: N<string, N<Event>, ?string>,
  get: N<N<HTMLElement>>,
  end: N<>,
};

export function bark(elm: HTMLElement): N<N<o_pith_t>> {
  const o = pith(elm);
  return function Ebark(nar) {
    nar(o), o.end();
  };
}
function pith(elm: HTMLElement, depth: number = 0): o_pith_t {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  var listeners_count = 0;
  const listeners = [];
  return {
    element(sel, nar, key) {
      let n, ob;
      const index = childs_count++;
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
            else return nar(ob), ob.end();
          childPiths.splice(index, 0, (ob = pith(n, depth + 1)));
          return nar(ob), ob.end();
        }
      n = document.createElement(tag);
      if (key) n.setAttribute("key", key);
      if (id) n.id = id;
      for (let str of classList) n.classList.add(str);
      elm.insertBefore(n, childNodes[index]),
        childPiths.splice(index, 0, (ob = pith(n, depth + 1)));
      nar(ob), ob.end();
    },
    text(text) {
      const index = childs_count++;
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
    },
    attr(name, value) {
      if (value != null) {
        if (elm.getAttribute(name) !== value) elm.setAttribute(name, value);
      } else {
        if (elm.hasAttribute(name)) elm.removeAttribute(name);
      }
    },
    style(name, value) {
      if (value != null) {
        if (elm.style.getPropertyValue(name) !== value)
          elm.style.setProperty(name, value);
      } else {
        if (elm.style.getPropertyValue(name)) elm.style.removeProperty(name);
      }
    },
    prop(name, value) {
      const m = (elm: { [string]: mixed });
      if (m[name] !== value) m[name] = value;
    },
    on(type, listener, mkey) {
      const index = listeners_count++;
      const key = mkey || hashString(listener.toString()) + "";
      for (let i = index, l = listeners.length; i < l; i++)
        if (listeners[i].type === type && listeners[i].key === key) {
          if (index < i) listeners.splice(index, 0, ...listeners.splice(i, 1));
          return;
        }
      listeners.splice(index, 0, { type, listener, key });
      elm.addEventListener(type, listener);
    },
    get(a) {
      a(elm);
    },
    end() {
      for (let l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);
      const piths = childPiths.splice(
        childs_count,
        childPiths.length - childs_count
      );
      childs_count = 0;
      const lstnrs = listeners.splice(
        listeners_count,
        listeners.length - listeners_count
      );
      listeners_count = 0;
      for (let mp of piths) mp && mp.end();
      for (let l of lstnrs) elm.removeEventListener(l.type, l.listener);
    },
  };
}
export type r_pith_t<S> = {
  ...o_pith_t,
  reduce: N<(S) => S>,
  element: N<string, N<r_pith_t<S>>, ?string>,
};
export function rring<S>(
  reduce: ((S) => S) => void
): (N<r_pith_t<S>>) => N<o_pith_t> {
  return (nar) =>
    function Erring(o) {
      nar({
        ...o,
        element(sel, nar, key) {
          o.element(sel, rring(reduce)(nar), key);
        },
        reduce,
      });
    };
}
export function rmap<A: { ... }, B>(
  o: N<(A) => A>
): (string, B) => N<(B) => B> {
  return (key, init) =>
    function Ermap(rb) {
      o((a) => {
        const ob = a[key] || init;
        const nb = rb(ob);
        if (ob === nb) return a;
        const ns = { ...a, [key]: nb };
        if (eq(init, nb)) delete ns[key];
        return ns;
      });
    };
}
function eq(a: mixed, b: mixed): boolean {
  return a === b
    ? true
    : a == null || b == null
    ? false
    : Array.isArray(a)
    ? Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => eq(v, b[i]))
    : a instanceof Date
    ? b instanceof Date && a.getTime() === b.getTime()
    : typeof a === "object"
    ? typeof b === "object" &&
      a.constructor === b.constructor &&
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every((k) => eq(a[k], b[k]))
    : false;
}
export function mmap<A: { ... }, B>(
  key: string,
  init: B
): (N<r_pith_t<B>>) => N<r_pith_t<A>> {
  return function map(nar) {
    return function Emmap(o) {
      nar({
        ...o,
        element(sel, nar, k) {
          o.element(sel, map(nar), k);
        },
        reduce: rmap(o.reduce)(key, init),
      });
    };
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
function hashString(s: string): number {
  for (var i = 0, h = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}