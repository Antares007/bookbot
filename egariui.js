const atack = [];
const A = (...args) => atack.push(args);
const S = () => atack.pop();
const nand = (a) => (b) => (o) => a(() => b(o));
const nor = (a) => (b) => (o) => {
  var f = true;
  a(() => {
    f = false;
    o();
  });
  if (f) b(o);
};
const counter = (o) => {
  const [d] = S();
  A("element", "button", (o) => {
    A("on", "click", (e) => {
      console.log(e.target);
    }),
      o();
    A("text", "+"), o();
    if (d) A(d - 1), counter(o);
  }),
    o();
  A("element", "button", (o) => {
    A("text", "-"), o();
    if (d) A(d - 1), counter(o);
  }),
    o();
  A("text", "0"), o();
};
const makePith = (elm) => {
  const { childNodes } = elm;
  const childPiths = [];
  var childs_count = 0;
  const listeners = [];
  var listeners_count = 0;
  return function pith() {
    const [m, ...rest] = S();
    if (m === "element") {
      const [tag, onar, key] = rest;
      let n, ob;
      const index = childs_count++;
      const TAG = tag.toUpperCase();
      for (let i = index, l = childNodes.length; i < l; i++)
        if (
          (n = childNodes[i]) &&
          n instanceof HTMLElement &&
          n.nodeName === TAG &&
          (key == null || n.getAttribute("key") === key)
        ) {
          if (index < i)
            elm.insertBefore(n, childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));

          if ((ob = childPiths[index]))
            if (key == null) return onar(ob), A(), ob();
            else return;
          childPiths.splice(index, 0, (ob = makePith(n)));
          return onar(ob), A(), ob();
        }
      n = document.createElement(TAG);
      if (key != null) n.setAttribute("key", key);
      elm.insertBefore(n, childNodes[index]),
        childPiths.splice(index, 0, (ob = makePith(n)));
      onar(ob), A(), ob();
    } else if (m === "text") {
      const [text] = rest;
      const index = childs_count++;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (
          childNodes[i].nodeType === 3 &&
          childNodes[i].textContent === text
        ) {
          if (index < i)
            elm.insertBefore(childNodes[i], childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          return;
        }
      elm.insertBefore(document.createTextNode(text), childNodes[index]),
        childPiths.splice(index, 0, null);
    } else if (m === "on") {
      const index = listeners_count++;
      for (let i = index, l = listeners.length; i < l; i++)
        if (
          listeners[i][0] === rest[0] &&
          listeners[i][1] === rest[1] &&
          listeners[i][2] === rest[2]
        ) {
          if (index < i) listeners.splice(index, 0, ...listeners.splice(i, 1));
          return;
        }
      elm.addEventListener(...rest), listeners.splice(index, 0, rest);
    } else if (m === void 0) {
      for (let l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);
      const oldChildPiths = childPiths.splice(
        childs_count,
        childPiths.length - childs_count
      );
      childs_count = 0;
      for (let ocp of oldChildPiths) ocp && (A(), ocp());
      const oldListeners = listeners.splice(
        listeners_count,
        listeners.length - listeners_count
      );
      listeners_count = 0;
      for (let ol of oldListeners) elm.removeEventListener(...ol);
    } else {
      //console.error("na");
    }
  };
};
const body = (document.body = document.createElement("body"));
const ob = makePith(body);
A(2), counter(ob);
A(), ob();
Object.assign(window, { A, S, o: ob, C: counter, atack });
