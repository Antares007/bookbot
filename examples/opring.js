// flow strict
import type { N } from "../src/purry";
const element = require("../src/element");
module.exports = function opring<S: { ... }>(
  key: string
): (N<element.r_pith_t<S>>) => N<element.r_pith_t<S>> {
  return (nar) => (op) =>
    element.mmap(
      "@opring",
      {}
    )(function mainnar(o) {
      const b = () => (mainnar(o), o.end());
      o.reduce((s) => {
        if (s[key])
          o.element(
            "table",
            (o) => {
              o.element("tr", (o) => {
                o.element("td", (o) =>
                  o.element("button", (o) => {
                    o.text("- " + key);
                    o.on("click", (e) => {
                      o.reduce((s) => {
                        const ns = { ...s, [key]: void 0 };
                        delete ns[key];
                        return ns;
                      });
                      b();
                    });
                  })
                );
                o.element("td", (o) => element.rring(op.reduce)(nar)(o));
              });
            },
            key
          );
        else
          o.element(
            "button",
            (o) => {
              o.text("+ " + key);
              o.on("click", (e) => {
                o.reduce((s) => ({ ...s, [key]: true }));
                b();
              });
            },
            key
          );

        return s;
      });
    })(op);
};
