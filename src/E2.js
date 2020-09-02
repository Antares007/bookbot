// @flow strict
function nar0(o) {
  o({
    t: ("element": "element"),
    v: { tag: "string", nar0, key: "string" },
  });
  o({
    t: ("element": "element"),
    v: { tag: "string", nar0 },
  });
  o({ t: ("text": "text"), v: "string" });
  o({ t: ("end": "end") });
}

function make(elm, depth = 0) {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  return function pith(r) {
    if ("element" === r.t) {
      const index = childs_count++;
      const l = childNodes.length;
      const TAG = r.v.tag.toUpperCase();
      var n;
      for (let i = index; i < l; i++)
        if (
          (n = childNodes[i]) &&
          n instanceof HTMLElement &&
          n.nodeName === TAG &&
          (!r.v.key || n.getAttribute("key") === r.v.key)
        ) {
          if (index < i) {
            elm.insertBefore(n, childNodes[index]);
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          let ob = childPiths[index];
          if (ob) {
            if (r.v.key) return;
            r.v.nar && r.v.nar(ob);
            ob({ t: "end" });
            return;
          }
          ob = make(n, depth + 1);
          childPiths.splice(index, 0, ob);
          r.v.nar && r.v.nar(ob);
          ob({ t: "end" });
          return;
        }
      const child = elm.insertBefore(
        document.createElement(TAG),
        childNodes[index]
      );
      if (r.v.key) child.setAttribute("key", r.v.key);
      const ob = make(child, depth + 1);
      childPiths.splice(index, 0, ob);
      r.v.nar && r.v.nar(ob);
      ob({ t: "end" });
    } else if ("text" === r.t) {
      const index = childs_count++;
      const l = childNodes.length;
      for (let i = index; i < l; i++)
        if (childNodes[i].nodeType === 3 && childNodes[i].textContent === r.v) {
          if (index < i) {
            elm.insertBefore(childNodes[i], childNodes[index]);
            childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          }
          return;
        }
      elm.insertBefore(document.createTextNode(r.v), childNodes[index]);
      childPiths.splice(index, 0, (o) => {});
    } else if ("end" === r.t) {
      for (let l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);

      const l = childPiths.length - childs_count;
      const rez = childPiths.splice(childs_count, l);
      childs_count = 0;
      for (let r of rez) r && r({ t: "end" });
    } else {
      throw new Error("invalid rvalue");
    }
  };
}

function C(o, depth = 3) {
  o("button", (o) => {
    o("+");
    depth && o("div", (o) => C(o, depth - 1));
  });
  o("button", (o) => {
    o("-");
    depth && o("div", (o) => C(o, depth - 1));
  });
  o("0");
}

const o = make((document.body = document.createElement("body")));
api(C)(o);
o({ t: "end" });

function api(nar) {
  return (o) => {
    nar(function pith(r, s, t) {
      if (r == null) {
        o({ t: "end" });
      } else if (s) {
        o({ t: "element", v: { tag: r, nar: api(s), key: t } });
      } else if ("string" === typeof r) {
        o({ t: "text", v: r });
      } else {
        o(r);
      }
    });
  };
}
