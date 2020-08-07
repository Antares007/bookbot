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
}

export type O2<S> =
  | void
  | string
  | {|
      _: "elm",
      ctor: () => HTMLElement,
      eq: (Node) => ?HTMLElement,
      bark: ((O2<S>) => void) => void,
    |}
  | {| _: "reduce", r: (S) => S |};

export function sc<S>(o: ((S) => S) => void, ob: (O) => void): (O2<S>) => void {
  const history: Array<O2<S>> = [];
  return function pith(x: O2<S>): void {
    // history.push(x);
    if (typeof x !== "object") {
      ob(x);
    } else if (x._ === "reduce") {
      o(x.r);
    } else if (x._ === "elm") {
      ob({ ...x, bark: (op) => x.bark(sc(o, op)) });
    } else ob(x);
  };
}
export const elm = <S>(
  tag: string,
  bark: ((O2<S>) => void) => void
): ({|
  _: "elm",
  bark: ((O2<S>) => void) => void,
  ctor: () => HTMLElement,
  eq: (Node) => ?HTMLElement,
|}) => {
  return {
    _: "elm",
    ctor() {
      return document.createElement(tag);
    },
    eq(n) {
      return n instanceof HTMLElement && n.nodeName === tag ? n : null;
    },
    bark,
  };
};
export const reduce = <S>(r: (S) => S): ({| _: "reduce", r: (S) => S |}) => ({
  _: ("reduce": "reduce"),
  r,
});
