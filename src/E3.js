// @flow strict
export type o_pith_t = {
  text: (string) => void,
  element: (string, (o_pith_t) => void, ?string) => void,
  attr: (string, ?string) => void,
  style: (string, ?string) => void,
  on: (string, (Event) => void) => void,
  end: () => void,
};

export function make(elm: HTMLElement, depth: number = 0): o_pith_t {
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
          childPiths.splice(index, 0, (ob = make(n, depth + 1)));
          return nar(ob), ob.end();
        }
      n = document.createElement(tag);
      if (key) n.setAttribute("key", key);
      if (id) n.id = id;
      for (let str of classList) n.classList.add(str);
      elm.insertBefore(n, childNodes[index]),
        childPiths.splice(index, 0, (ob = make(n, depth + 1)));
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
      if (value) {
        if (elm.getAttribute(name) !== value) elm.setAttribute(name, value);
      } else {
        if (elm.getAttribute(name)) elm.removeAttribute(name);
      }
    },
    style(name, value) {
      if (value) {
        if (elm.style.getPropertyValue(name) !== value)
          elm.style.setProperty(name, value);
      } else {
        if (elm.style.getPropertyValue(name)) elm.style.removeProperty(name);
      }
    },
    on(type, listener) {
      const index = listeners_count++;
      for (let i = index, l = listeners.length; i < l; i++)
        if (listeners[i].type === type && listeners[i].listener === listener) {
          if (index < i) listeners.splice(index, 0, ...listeners.splice(i, 1));
          return;
        }
      listeners.splice(index, 0, { type, listener });
      elm.addEventListener(type, listener);
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
  reduce: ((S) => S) => void,
  element: (string, (r_pith_t<S>) => void, ?string) => void,
};
export function rring<S>(
  reduce: ((S) => S) => void
): ((r_pith_t<S>) => void) => (o_pith_t) => void {
  return (nar) => (o) => {
    nar({
      ...o,
      element(sel, nar, key) {
        o.element(sel, rring(reduce)(nar), key);
      },
      reduce,
    });
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