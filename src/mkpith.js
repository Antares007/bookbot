// @flow strict
export type Ring<S> = ((Pith<S>) => void) => void;
export type Pith<S> =
  | string
  | Ring<S>
  | {| _: "elm", tag: string, ring: Ring<S> |}
  | {| _: "reduce", g: (S) => S |};

export const mkpith = <S>(
  o: ((S) => S) => void,
  elm: HTMLElement
): ((Pith<S>) => void) => {
  var lastIndex: number;
  var dispose: ?() => void;
  const childPiths: Array<?(Pith<S>) => void> = [];
  const { childNodes } = elm;
  var pring: ?Ring<S>;
  return function pith(x: Pith<S>): void {
    if (typeof x === "function") {
      if (pring === x) {
        console.log("a");
        return;
      }
      pring = x;
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
      o((s) => {
        const ns = x.g(s);
        if (ns !== s) pring = null;
        return ns;
      });
    } else if (x._ === "elm") {
      const index = lastIndex++;
      for (let i = index, l = childNodes.length; i < l; i++) {
        let n = childNodes[i];
        const ob = childPiths[i];
        if (ob) ob;

        if (n instanceof HTMLElement && n.nodeName === x.tag) {
          if (index < i) elm.insertBefore(n, childNodes[index]);
          return mkpith(o, n)(x.ring);
        }
      }
      const child = document.createElement(x.tag);
      const ob = mkpith(o, elm.insertBefore(child, childNodes[index]));
      childPiths[index] = ob;
      ob(x.ring);
      // ob, child, x.ring;
    } else {
      // elm.addEventListener("click", x.f);
    }
  };
};
