// @flow
const draw = (ring) =>
  typeof ring === "function" ? { r: ("draw": "draw"), ring } : ring.ring;
const elm = (tag, pith) => ({ r: ("elm": "elm"), tag, pith });
const button = (pith) => elm("BUTTON", pith);
const div = (pith) => elm("DIV", pith);
const onClick = (f: (MouseEvent) => mixed) => ({
  r: ("handler": "handler"),
  f,
});
const reduce = (g) => ({ r: ("reduce": "reduce"), g });
var di = 0;
function counter(o, d: number = 3) {
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

const mkpith = (
  o,
  elm: HTMLElement,
  vnode = { disposables: [], childs: [] }
) => {
  var lastIndex;
  const { childNodes } = elm;
  return function pith(x) {
    if (typeof x === "function") {
      // ring
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
    } else if (x.r === "reduce") {
      o(x.g);
    } else if (x.r === "elm") {
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
      elm.addEventListener("click", x.f);
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
