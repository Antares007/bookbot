module.exports = makeBark;
function text(text) {
  const o = this;
  const s = o.s;
  const elm = s.elm;
  const index = s.childs_count++;
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
function on(eventtype, listener, options) {
  const o = this;
  const s = o.s;
  const elm = s.elm;
}
function element(tag, nar, ...args) {
  const o = this;
  const s = o.s;
  const elm = s.elm;
  const index = s.childs_count++;
  const TAG = tag.toUpperCase();
  let n;
  for (let i = index, l = elm.childNodes.length; i < l; i++)
    if ((n = elm.childNodes[i]) && n.nodeName === TAG) {
      if (index < i) elm.insertBefore(n, elm.childNodes[index]);
      n.o.b(nar, ...args);
      return;
    }
  n = makeBark(document.createElement(TAG));
  n.o.b(nar, ...args);
  elm.insertBefore(n, elm.childNodes[index]);
}
function b(nar, ...args) {
  const o = this;
  const s = o.s;
  const elm = s.elm;
  if (s.nar === nar && eq(s.args, args)) return console.log(elm.nodeName, args);
  s.nar = nar;
  s.args = args;
  nar(o, ...args);
  for (let l = elm.childNodes.length; l > s.childs_count; l--)
    elm.removeChild(elm.childNodes[s.childs_count]);
  s.childs_count = 0;
}
function makeBark(elm) {
  const o = {
    element,
    text,
    on,
    b,
    s: {
      childs_count: 0,
      args: [],
      nar: enar,
      elm,
    },
  };
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
