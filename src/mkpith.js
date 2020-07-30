// @flow strict
export type Ring<S> = ((Pith<S>) => void) => void;
export type Pith<S> =
  | string
  | Ring<S>
  | {| _: "elm", tag: string, ring: Ring<S> |}
  | {| _: "reduce", g: (S) => S |};

export const mkpith = <S>(
  o: ((S) => S) => void,
  elm: HTMLElement,
  vnode: {} = { disposables: [], childs: [] }
): ((Pith<S>) => void) => {
  var lastIndex;
  const { childNodes } = elm;
  return function pith(x: Pith<S>): void {
    if (typeof x === "function") {
      lastIndex = 0;
      x(pith);
      for (let l = childNodes.length; l > lastIndex; l--)
        elm.removeChild(childNodes[lastIndex]);
      return;
    } else if (typeof x === "string") {
      const index = lastIndex++;
      for (let i = index, l = childNodes.length; i < l; i++) {
        let n = childNodes[i];
        if (n.nodeType === 3 && n.textContent === x) {
          if (index < i) elm.insertBefore(n, childNodes[index]);
          return;
        }
      }
      elm.insertBefore(document.createTextNode(x), childNodes[index]);
    } else if (x._ === "reduce") {
      o((s) => x.g(s));
    } else if (x._ === "elm") {
      const index = lastIndex++;
      for (let i = index, l = childNodes.length; i < l; i++) {
        let n = childNodes[i];
        if (n instanceof HTMLElement && n.nodeName === x.tag) {
          if (index < i) elm.insertBefore(n, childNodes[index]);
          return mkpith(o, n)(x.ring);
        }
      }
      mkpith(
        o,
        elm.insertBefore(document.createElement(x.tag), childNodes[index])
      )(x.ring);
    } else {
      //elm.addEventListener("click", x.f);
    }
  };
};
