const button2 = (o, d, l) => {
  if (o.Reduce) o.Reduce("aba" + d + l);
  o.text(l);
  if (d) counter2(o, d - 1);
};
const counter2 = (o, d) => {
  if (o.Reduce) o.Reduce("abo" + d);
  o.element("button", button2, d, "+");
  o.element("button", button2, d, "-");
  o.text("0");
};
const ring = (nar) => (o, ...args) => {
  nar(
    {
      element: (tag, nar, ...args) => o.element(tag, ring(nar), ...args),
      text: (...args) => o.text(...args),
      Reduce: (r) => console.log(r),
    },
    ...args
  );
};
const body = makeBark((document.body = document.createElement("body")));
body.b(ring(counter2), 1);

Object.assign(window, { counter2 });

function text(text) {
  const o = this;
  const elm = o.elm;
  const index = o.childs_count++;
  for (let i = index, l = elm.childNodes.length; i < l; i++)
    if (
      elm.childNodes[i].nodeType === 3 &&
      elm.childNodes[i].textContent === text
    ) {
      if (index < i) elm.insertBefore(elm.childNodes[i], elm.childNodes[index]);
      return;
    }
  elm.insertBefore(document.createTextNode(text), elm.childNodes[index]);
}
function element(tag, nar, ...args) {
  const o = this;
  const elm = o.elm;
  const index = o.childs_count++;
  const TAG = tag.toUpperCase();
  let n;
  for (let i = index, l = elm.childNodes.length; i < l; i++)
    if ((n = elm.childNodes[i]) && n.nodeName === TAG) {
      if (index < i) elm.insertBefore(n, elm.childNodes[index]);
      n.b(nar, ...args);
      return;
    }
  n = makeBark(document.createElement(TAG));
  n.b(nar, ...args);
  elm.insertBefore(n, elm.childNodes[index]);
}
function b(nar, ...args) {
  const elm = this;
  const o = elm.o;
  if (o.nar === nar && eq(o.args, args)) return console.log(elm.nodeName, args);
  o.nar = nar;
  o.args = args;
  nar(o, ...args);
  for (let l = elm.childNodes.length; l > o.childs_count; l--)
    elm.removeChild(elm.childNodes[o.childs_count]);
  o.childs_count = 0;
}
function makeBark(elm) {
  const o = {
    element,
    text,
    childs_count: 0,
    args: [],
    nar: enar,
    elm,
  };
  elm.b = b;
  elm.o = o;
  return elm;
}
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
function enar() {}
