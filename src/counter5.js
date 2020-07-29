// @flow strict
const elm = (tag, pith) => ({ type: ("elm": "elm"), tag, pith });
const button = (pith) => elm("BUTTON", pith);
const div = (pith) => elm("DIV", pith);
const onClick = (f: (MouseEvent) => mixed) => ({
  type: ("handler": "handler"),
  f,
});
const ring = (props, f) => ({ type: ("ring": "ring"), props, f });
var di = 0;
function counter(o, props: {| d: number |}) {
  const ob = o;
  o(
    button(
      ring(props, (o, { d }) => {
        o("+");
        o(
          onClick((e) => {
            ob((s) => {
              return { ...s, n: s.n + 1 };
            });
            ob(
              ring({ d }, (o, p) => {
                counter((r) => {
                  if (typeof r === "function")
                    o((s) => {
                      return { ...s, ["+"]: r(s["+"] || { n: 1 }) };
                    });
                  else o(r);
                }, p);
              })
            );
          })
        );
        if (d > 0) o(div(ring({ d: d - 1 }, counter)));
      })
    )
  );
  o(
    button(
      ring(props, (o, { d }) => {
        o("-");
        if (d > 0) o(div(ring({ d: d - 1 }, counter)));
      })
    )
  );
  o((s) => {
    o(s.n + "");
    return s;
  });
}

// function page1(o, p) {
//   o("page 1");
//   o(div({ d: 1 }, switcher));
// }
// function page2(o, p) {}
// function switcher(o, p) {}

const mkpith = (o, elm: HTMLElement) => {
  var lastIndex;
  const { childNodes } = elm;
  return function pith(x) {
    if (typeof x === "function") {
      o(x);
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
    } else if (x == null) {
    } else if (x.type === "ring") {
      lastIndex = 0;
      x.f(pith, x.props);
      for (let l = childNodes.length; l > lastIndex; l--)
        elm.removeChild(childNodes[lastIndex]);
      return;
    } else if (x.type === "elm") {
      const index = lastIndex++;
      for (let i = index, l = childNodes.length; i < l; i++) {
        let n = childNodes[i];
        if (n instanceof HTMLElement && n.nodeName === x.tag) {
          if (index < i) elm.insertBefore(n, childNodes[index]);
          return mkpith(o, n)(ring(x.pith.props, x.pith.f));
        }
      }
      mkpith(
        o,
        elm.insertBefore(document.createElement(x.tag), childNodes[index])
      )(ring(x.pith.props, x.pith.f));
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
  state = r(state);
  console.info(state);
}, rootNode);
bark(ring({ d: 1 }, counter));
bark();
