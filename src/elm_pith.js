// @flow strict
export type O =
  | void
  | string
  | {|
      _: "elm",
      ctor: () => HTMLElement,
      eq: (Node) => ?HTMLElement,
      bark: ((O) => void) => void,
    |};
export function empty<T>(_: T) {}
export function create(elm: Element): (O) => void {
  var count = 0;
  const { childNodes } = elm;
  const childPiths: Array<(O) => void> = [];
  return function pith(x: O): void {
    if (x == null) {
      for (let l = childNodes.length; l > count; l--) {
        elm.removeChild(childNodes[count]);
        childPiths.splice(count, 1);
      }
      count = 0;
    } else if (typeof x === "string") {
      const index = count++;
      for (let i = index, l = childNodes.length; i < l; i++)
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
      const index = count++;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (x.eq(childNodes[i])) {
          if (index < i) {
            elm.insertBefore(childNodes[i], childNodes[index]);
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          const ob = childPiths[index];
          x.bark(ob);
          return;
        }
      const child = x.ctor();
      const ob = create(child);
      elm.insertBefore(child, childNodes[index]);
      childPiths.splice(index, 0, ob);
      x.bark(ob);
    } else {
      (x: empty);
      throw new Error("x not empty");
    }
  };
};
const p2 = <S>(o: (S) => S, elm: HTMLElement): ((O) => void) => {
  const ob = create(elm);
  return function pith(x) {
    ob(x);
  };
};

