// @flow strict

export type o_pith_t = (
  void | string,
  void | string | ((o_pith_t) => void),
  void | string | ((Event) => void)
) => void;

function see(o: o_pith_t) {
  o("a", "value", "hello");

  o("s", "background", "white");

  o("on", "click", (e) => {});
  o("on", "dispose", () => {});

  o("button", (o) => {}, "key");

  o("hello");

  o();
}
function make(elm: HTMLElement): o_pith_t {
  return function pith(r, s, t) {
    if ("string" === typeof r) {
      if ("function" === typeof s) {
        const sel = r;
        const nar = s;
        const key = "function" === typeof t ? t.toString() : t;
      } else if ("a" === r) {
        if (s) {
          const aname = s;
          if (t) {
            const avalue = t.toString();
            if (elm.getAttribute(s) !== avalue) elm.setAttribute(aname, avalue);
          } else {
            if (elm.getAttribute(s)) elm.removeAttribute(s);
          }
        } else {
          r, s, t;
        }
      } else if ("s" === r) {
        if (s) {
          const sname = s;
          if (t) {
            const svalue = t.toString();
            if (elm.style.getPropertyValue(s) !== svalue)
              elm.style.setProperty(sname, svalue);
          } else {
            if (elm.style.getPropertyValue(s)) elm.style.removeProperty(s);
          }
        } else {
          r, s, t;
        }
      } else if ("on" === r) {
        r, s, t;
      } else {
        r, s, t;
      }
    } else {
      r, s, t;
    }
    //
  };
}
