// @flow strict
const elm = (tag, props, pith) => ({ type: ("elm": "elm"), tag, props, pith });
const button = (props, pith) => elm("BUTTON", props, pith);
const div = (props, pith) => elm("DIV", props, pith);
const onClick = (f: (MouseEvent) => mixed) => ({
  type: ("handler": "handler"),
  f,
});
var di = 0;
function counter(o, props: {| d: number |}) {
  const ob = o;
  o(
    button(props, (o, { d }) => {
      o("+");
      o(
        onClick((e) => {
          di++;
          console.log(d);
          ob(counter, { d });
        })
      );
      if (d > 0) o(div({ d: d - 1 }, counter));
    })
  );
  o(
    button(props, (o, { d }) => {
      o("-");
      if (d > 0) o(div({ d: d - 1 }, counter));
    })
  );
  o(props.d + di + "");
}

const mkpith = (elm: HTMLElement) => {
  var lastIndex;
  const { childNodes } = elm;
  return function pith(x, props) {
    if (x == null) {
      // dispose
    } else if (typeof x === "function") {
      lastIndex = 0;
      if (props != null) x(pith, props);
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
          return mkpith(n)(x.pith, x.props);
        }
      }
      mkpith(
        elm.insertBefore(document.createElement(x.tag), childNodes[index])
      )(x.pith, x.props);
    } else {
      elm.addEventListener("click", x.f);
    }
  };
};
const rootNode = document.getElementById("root-node");
if (!rootNode) throw new Error("cant find root-node");
const bark = mkpith(rootNode);
bark(counter, { d: 1 });
bark();
