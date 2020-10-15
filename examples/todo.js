// flow strict
import type { N } from "../src/purry";
import * as element from "../src/element";

module.exports = (element.mmap("todoapp", {
  text: "init value",
  list: [],
})((o) =>
  o.element("div", function nar(o) {
    const b = (nar) => (nar(o), o.end());
    o.element("input", (o) => {
      o.on("input", (e) => {
        const t = e.target;
        if (t instanceof HTMLInputElement) {
          o.reduce((s) => ({ ...s, text: t.value }));
          b(nar);
        }
      });
      o.reduce((s) => (o.prop("value", s.text), s));
    });
    o.element("button", (o) => {
      o.on("click", () => {
        o.reduce((s) => ({
          ...s,
          text: "",
          list: [...s.list, s.text.trim()],
        }));
        b(nar);
      });
      o.text("add");
      o.reduce((s) => (o.attr("disabled", s.text ? null : ""), s));
    });
    o.element("div", (o) => {
      o.reduce((s) => {
        o.element("ul", (o) => {
          s.list.forEach((str, i) => {
            o.element("li", (o) => {
              o.element("button", (o) => {
                o.on("click", (e) => {
                  o.reduce((s) => {
                    return {
                      ...s,
                      text: s.list[i],
                      list: s.list.filter((s, si) => si !== i),
                    };
                  });
                  b(nar);
                });
                o.text("x");
              });
              o.text(str);
            });
          });
        });
        return s;
      });
    });
  })
): N<element.r_pith_t<{}>>);
