// @flow strict
const elm = (tag, pith) => ({ tag, pith });
const button = (pith) => elm("BUTTON", pith);
const div = (pith) => elm("DIV", pith);
const counter = (d = 3) => (o, s) => {
  o(
    button((o, s) => {
      o("+");
      if (d > 0) o(div(counter(d - 1)));
    })
  );
  o(
    button((o, s) => {
      o("-");
      if (d > 0) o(div(counter(d - 1)));
    })
  );
  o(s.n + d + "");
};
const mkpith = (elm: HTMLElement, state) => {
  var lastIndex;
  const { childNodes } = elm;
  return function pith(x) {
    if (typeof x === "function") {
      lastIndex = 0;
      x(pith, state);
      for (let l = childNodes.length; l > lastIndex; l--)
        elm.removeChild(childNodes[lastIndex]);
      return;
    }
    const index = lastIndex++;

    if (typeof x === "string") {
      for (let i = index, l = childNodes.length; i < l; i++) {
        let n = childNodes[i];
        if (n.nodeType === 3) {
          if (index < i) elm.insertBefore(n, childNodes[index]);
          return (n.textContent = x);
        }
      }
      elm.insertBefore(document.createTextNode(x), null);
    } else {
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
    }
  };
};
const rootNode = document.getElementById("root-node");
if (!rootNode) throw new Error("cant find root-node");
const bark = mkpith(rootNode, { n: 9 });
bark(counter(2));
bark(counter(2));
