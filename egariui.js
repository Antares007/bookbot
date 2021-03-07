const { atack, A, S } = require("./atack");
const nand = (a) => (b) => (o) => a(() => b(o));
const nor = (a) => (b) => (o) => {
  var f = true;
  a(() => {
    f = false;
    o();
  });
  if (f) b(o);
};

const button1 = (o) => {
  const [d, text] = S();
  A("text", text), o.o();
  if (d) A(d - 1), counter(o);
  else A(), o.o();
};
const counter = (o) => {
  const [d] = S();
  A(d, window.aaa ? "+" : "-"), A("element", "button", button1), o.o();
  A(d, window.aaa ? "-" : "+"), A("element", "button", button1), o.o();
  A("text", "0"), o.o();
  A(), o.o();
};
const button2 = (o, d, l) => {
  o.text(l);
  if (d) counter2(o, d - 1);
};
const counter2 = (o, d) => {
  o.element("button", button2, d, "+");
  o.element("button", button2, d, "-");
  o.text("0");
};
function o() {
  const [m, ...rest] = S();
  if (m === "element") {
    const [tag, nar] = rest;
    const index = this.childs_count++;
    const TAG = tag.toUpperCase();
    let n;
    for (let i = index, l = this.childNodes.length; i < l; i++)
      if (
        (n = this.childNodes[i]) &&
        n.nodeName === TAG &&
        n.nar === nar &&
        eq(n.args, atack[atack.length - 1])
      ) {
        if (index < i) this.insertBefore(n, this.childNodes[index]);
        return;
      }
    n = makePith(document.createElement(TAG));
    n.nar = nar;
    n.args = atack[atack.length - 1];
    nar(n);
    this.insertBefore(n, this.childNodes[index]);
  } else if (m === "text") {
    const [text] = rest;
    const index = this.childs_count++;
    for (let i = index, l = this.childNodes.length; i < l; i++)
      if (
        this.childNodes[i].nodeType === 3 &&
        this.childNodes[i].textContent === text
      ) {
        if (index < i)
          this.insertBefore(this.childNodes[i], this.childNodes[index]);
        return;
      }
    this.insertBefore(document.createTextNode(text), this.childNodes[index]);
  } else if (m === void 0) {
    for (let l = this.childNodes.length; l > this.childs_count; l--)
      this.removeChild(this.childNodes[this.childs_count]);
    this.childs_count = 0;
  } else {
    console.error("na");
  }
}
const body = (document.body = document.createElement("body"));
const makePith = (elm) => {
  elm.o = o;
  elm.childs_count = 0;
  return elm;
};
A(2), counter(makePith(body));

const makeBark = () => {
  const [elm] = S();
  A(elm);
};
const [elm] = (A(1), makeBark(), S());
console.log(elm);

Object.assign(window, { A, S, C: counter, o: body, atack });
function eq(a, b) {
  return a === b
    ? true
    : a == null || b == null
    ? false
    : Array.isArray(a)
    ? Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => eq(v, b[i]))
    : a instanceof Date
    ? b instanceof Date && a.getTime() === b.getTime()
    : typeof a === "object"
    ? typeof b === "object" &&
      a.constructor === b.constructor &&
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every((k) => eq(a[k], b[k]))
    : false;
}
