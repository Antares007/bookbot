// @flow strict

const counter = (d = 3) => (o) => {
  const op = o;
  o.button((o) => {
    o.text("+");
    o.onClick((e) => {
      o.state.n++;
      op.setState(o.state);
    });
    if (d > 0) o.div(counter(d - 1));
  });
  o.button((o) => {
    o.text("-");
    if (d > 0) o.div(counter(d - 1));
  });
  o.text(o.state.n + "");
};
const mkpith = (elm: HTMLElement) => ({
  run(b) {
    b(this);
  },
  setState(s) {},
  onClick(h: (MouseEvent) => void) {},
  elm(tag, b) {
    const btn = document.createElement(tag);
    const o = mkpith(btn);
    elm.insertBefore(btn, null);
    o.run(b);
  },
  text(txt) {
    const text = document.createTextNode(txt);
    elm.insertBefore(text, null);
  },
  div(b) {
    this.elm("div", b);
  },
  button(b) {
    this.elm("button", b);
  },
  state: { n: 9 },
});
const rootNode = document.getElementById("root-node");
if (!rootNode) throw new Error("cant find root-node");
mkpith(rootNode).run(counter(2));
