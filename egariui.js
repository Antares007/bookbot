function makePith(elm, depth=0) {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  return function pith(t, ...args) {
    if (t === "element") {
      const [tag, onar, key] = args;
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
            if (key == null) return onar(ob), ob();
            else return;
          childPiths.splice(index, 0, (ob = makePith( n, depth + 1)));
          return onar(ob), ob();
        }
      n = document.createElement(TAG);
      if (key != null) n.setAttribute("key", key);
      elm.insertBefore(n, childNodes[index]),
        childPiths.splice(index, 0, (ob = makePith( n, depth + 1)));
      onar(ob), ob();
    } else if (t === "text") {
      const [text] = args;
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
    } else if (t === "get") {
      args[0](elm);
    } else if (t === void 0) {
      for (let l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);
      const piths = childPiths.splice(
        childs_count,
        childPiths.length - childs_count
      );
      childs_count = 0;
      for (let mp of piths) mp && mp();
    }
  };
}
