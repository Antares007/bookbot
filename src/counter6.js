// @flow strict
type O =
  | void
  | string
  | (((O) => void) => void)
  | {|
      _: "elm",
      ctor: () => HTMLElement,
      eq: (Node) => ?HTMLElement,
      bark: ((O) => void) => void,
    |};

const elm = (tag, bark, key: ?string) => {
  const ctor = () => document.createElement(tag);
  const eq = (n) => (n instanceof HTMLElement && n.nodeName === tag ? n : null);
  return key
    ? {
        _: "elm",
        ctor: () => {
          const n = ctor();
          n.id = key;
          return n;
        },
        eq: (n) => {
          const nn = eq(n);
          return nn && nn.id === key ? nn : null;
        },
        bark,
      }
    : { _: "elm", ctor, eq, bark };
};

function empty(_) {}

function counter(o, d = 1) {
  o(
    elm("button", (o) => {
      o("+");
      if (d > 0) o(elm("div", (o) => counter(o, d - 1)));
    })
  );
  o(
    elm("button", (o) => {
      o("-");
      if (d > 0) o(elm("div", (o) => counter(o, d - 1)));
    })
  );
  o("0");
}

export const mkpith = <S>(elm: HTMLElement): ((O) => void) => {
  var count = 0;
  const { childNodes } = elm;
  const childPiths: Array<(O) => void> = [];
  return function pith(x: O): void {
    if (x == null) {
      for (let l = childNodes.length; l > count; l--) {
        elm.removeChild(childNodes[count]);
        childPiths.splice(count, 1)[0](empty);
      }
      count = 0;
    } else if (typeof x === "function") {
      x(pith);
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
      let n;
      for (let i = index, l = childNodes.length; i < l; i++)
        if ((n = x.eq(childNodes[i]))) {
          if (index < i) {
            elm.insertBefore(childNodes[i], childNodes[index]);
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          const ob = childPiths[index];
          x.bark(ob);
          return;
        }
      const child = x.ctor();
      const ob = mkpith(child);
      elm.insertBefore(child, childNodes[index]);
      childPiths.splice(index, 0, ob);
      x.bark(ob);
    } else {
      throw new Error("n/i");
    }
  };
};

const root = document.querySelector("#root-node");
if (!root) throw new Error("root");

const ob = mkpith(root);

counter(ob);
counter(ob);
ob();
counter(ob);
ob();
