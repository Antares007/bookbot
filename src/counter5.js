// @flow
const elm = (tag, pith) => ({ _: ("elm": "elm"), tag, pith });
const onClick = (f: (MouseEvent) => mixed) => ({
  _: ("handler": "handler"),
  f,
});
const reduce = (g) => ({ _: ("reduce": "reduce"), g });
const button = (pith) => elm("BUTTON", pith);
const div = (pith) => elm("DIV", pith);
var di = 0;
function counter(o: (Pith<{ n: number }>) => void, d: number = 1) {
  o(
    button((o) => {
      o("+");
      if (d > 0) o(div((o) => counter((r) => o(r), d - 1)));
    })
  );
  o(
    button((o) => {
      o("-");
      if (d > 0) o(div((o) => counter(o, d - 1)));
    })
  );
  o(
    reduce((s) => {
      o(s.n + "");
      return s;
    })
  );
}
type Ring<S> = ((Pith<S>) => void) => void;
type Pith<S> =
  | string
  | Ring<S>
  | {| _: "elm", tag: string, pith: Ring<S> |}
  | {| _: "reduce", g: (S) => S |};
const mkpith = <S>(
  o: ((S) => S) => void,
  elm: HTMLElement,
  vnode = { disposables: [], childs: [] }
): ((Pith<S>) => void) => {
  var lastIndex;
  const { childNodes } = elm;
  return function pith(x): void {
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
          return mkpith(o, n)(x.pith);
        }
      }
      mkpith(
        o,
        elm.insertBefore(document.createElement(x.tag), childNodes[index])
      )(x.pith);
    } else {
      //elm.addEventListener("click", x.f);
    }
  };
};
const rootNode = document.getElementById("root-node");
if (!rootNode) throw new Error("cant find root-node");

var state: { n: number } = { n: 0 };
console.info(state);

const bark = mkpith((r) => {
  const os = state;
  state = r(state);
  if (os !== state) console.info(state);
}, rootNode);

bark(counter);

// function page1(o, p) {
//   o("page 1");
//   o(div({ d: 1 }, switcher));
// }
// function page2(o, p) {}
// function switcher(o, p) {}
