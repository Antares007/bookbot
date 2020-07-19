// @flow strict
const elm = (tag, pith) => ({ type: "elm", tag, pith });
const button = (pith) => elm("BUTTON", pith);
const div = (pith) => elm("DIV", pith);
const onClick = (f) => ({ type: "handler", f });
const counter = (d = 2) => {
  var di = 0;
  return function ring(o, s) {
    const ob = o;
    o(
      button((o, s) => {
        o("+");
        o(
          onClick((e) => {
            di++;
            ob(ring);
          })
        );
        if (d > 0) o(div(counter(d - 1)));
      })
    );
    o(
      button((o, s) => {
        o("-");
        o(
          onClick((e) => {
            di--;
            ob(ring);
          })
        );
        if (d > 0) o(div(counter(d - 1)));
      })
    );
    if (d == 2)
      setTimeout(() => {
        di++;
        o(ring);
      }, 1000);
    o(di + "");
  };
};

type Ring = ((x: Pith) => void, {| n: number |}) => void;
type Pith =
  | string
  | Ring
  | {| type: "elm", tag: string, pith: Ring |}
  | {| type: "handler", f: (Event) => void |};

const mkpith = (elm: HTMLElement, state) => {
  var lastIndex;
  const { childNodes } = elm;
  return function pith(x: Pith) {
    if (typeof x === "function") {
      lastIndex = 0;
      x(pith, state);
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
    } else if (x.type === "elm") {
      const index = lastIndex++;
      for (let i = index, l = childNodes.length; i < l; i++) {
        let n = childNodes[i];
        if (n instanceof HTMLElement && n.nodeName === x.tag) {
          if (index < i) elm.insertBefore(n, childNodes[index]);
          return mkpith(n, state)(x.pith);
        }
      }
      mkpith(
        elm.insertBefore(document.createElement(x.tag), childNodes[index]),
        state
      )(x.pith);
    } else {
      //console.log(x.f.toString());
    }
  };
};
const rootNode = document.getElementById("root-node");
if (!rootNode) throw new Error("cant find root-node");
const bark = mkpith(rootNode, { n: 9 });
bark(counter());
