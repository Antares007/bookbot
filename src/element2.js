// @flow strict
const { A, B, C } = require("./abc");
const makePith:mixed = B(({ n: [depth], o: [elm] }) => {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  const pith = B(
    ({ s: [t = "element", tag], f: [nar] }) => C(pith, t, tag, nar, ""),
    ({ s: [t = "element", tag, key], f: [nar] }) => {
      let n, ob;
      const index = childs_count++;
      const TAG = tag.toUpperCase();
      for (let i = index, l = childNodes.length; i < l; i++)
        if (
          (n = childNodes[i]) &&
          n instanceof HTMLElement &&
          n.nodeName === TAG &&
          (key === '' || n.getAttribute("key") === key)
        ) {
          if (index < i)
            elm.insertBefore(n, childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));

          if ((ob = childPiths[index]))
            if (key !== '') return;
            else return C(nar,ob), C(ob);
          childPiths.splice(index, 0, (ob = C(makePith,n, depth + 1)));
          return C(nar,ob), C(ob);
        }
      n = document.createElement(TAG);
      if (key !== '') n.setAttribute("key", key);
      elm.insertBefore(n, childNodes[index]),
        childPiths.splice(index, 0, (ob = C(makePith,n, depth + 1)));
      C(nar,ob), C(ob);
    },
    ({ s: [text] }) => {
      const index = childs_count++;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (childNodes[i].nodeType === 3 && childNodes[i].textContent === text) {
          if (index < i)
            elm.insertBefore(childNodes[i], childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          return;
        }
      elm.insertBefore(document.createTextNode(text), childNodes[index]),
        childPiths.splice(index, 0, null);
    },
    ({ s: [t = "get"], f: [f] }) => C(f,elm),
    ({}) => {
      for (let l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);
      const piths = childPiths.splice(
        childs_count,
        childPiths.length - childs_count
      );
      childs_count = 0;
      for (let mp of piths) mp && C(mp);
    }
  );
  return pith;
});
module.exports = makePith
