// @flow strict
type O<S> =
  | string
  | (((O<S>) => void) => void)
  | {| _: "elm", tag: string, key?: string, bark: ((O<S>) => void) => void |}
  | {| _: "reduce", g: (S) => S |}
  | {| _: "click", f: (MouseEvent) => mixed |};

function empty(_) {}

export const mkpith = <S>(
  o: ((S) => S) => void,
  elm: HTMLElement
): ((O<S>) => void) => {
  var seed: ?((O<S>) => void) => void;
  var lastIndex: number;
  var dispose: ?() => void;
  const { childNodes } = elm;
  const childPiths: Array<(O<S>) => void> = new Array(childNodes.length);
  const keys: Array<?string> = new Array(childNodes.length);
  return function pith(x: O<S>): void {
    if (typeof x === "function") {
      if (seed === x) return console.log("a");
      dispose = dispose && dispose();
      lastIndex = 0;
      x(pith);
      seed = x;
      for (let l = childNodes.length; l > lastIndex; l--) {
        elm.removeChild(childNodes[lastIndex]);
        keys.splice(lastIndex, 1);
        childPiths.splice(lastIndex, 1)[0](empty);
      }
    } else if (typeof x === "string") {
      const index = lastIndex++;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (childNodes[i].nodeType === 3 && childNodes[i].textContent === x) {
          if (index < i) {
            elm.insertBefore(childNodes[i], childNodes[index]);
            keys.splice(index, 0, ...keys.splice(i, 1));
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          return;
        }
      elm.insertBefore(document.createTextNode(x), childNodes[index]);
      keys.splice(index, 0, null);
      childPiths.splice(index, 0, empty);
    } else if (x._ === "reduce") {
      o(x.g);
    } else if (x._ === "elm") {
      const index = lastIndex++;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (
          childNodes[i] instanceof HTMLElement &&
          childNodes[i].nodeName === x.tag &&
          (x.key == null || keys[i] === x.key)
        ) {
          if (index < i) {
            elm.insertBefore(childNodes[i], childNodes[index]);
            keys.splice(index, 0, ...keys.splice(i, 1));
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          if (!seed) childPiths[index] = mkpith(o, childNodes[i]);
          childPiths[index](x.bark);
          return;
        }
      const child = document.createElement(x.tag);
      const ob = mkpith(o, child);
      elm.insertBefore(child, childNodes[index]);
      keys.splice(index, 0, x.key);
      childPiths.splice(index, 0, ob);
      ob(x.bark);
    } else {
      const d = dispose;
      elm.addEventListener(x._, x.f);
      dispose = () => {
        elm.removeEventListener(x._, x.f);
        d && d();
      };
    }
  };
};
