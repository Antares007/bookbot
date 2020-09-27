// @flow strict
import type { N } from "./p";
const E = require("./E3");

export type pith_t<S> = {
  ...E.r_pith_t<S>,
  head: N<N<E.o_pith_t>>,
  element: N<string, N<pith_t<S>>, ?string>,
};
export function ring<S: { ... }>(
  oh: E.o_pith_t
): (N<pith_t<S>>) => N<E.r_pith_t<S>> {
  return (nar) => (o) => {
    nar({
      ...o,
      head(nar) {
        nar(oh);
      },
      element(sel, nar, key) {
        o.element(sel, ring(oh)(nar), key);
      },
    });
  };
}
export function bark<S: { ... }>(r: N<(S) => S>): N<N<pith_t<S>>> {
  const oh = E.pith(
    document.head || (document.head = document.createElement("head"))
  );
  const ob = E.pith(
    document.body || (document.body = document.createElement("body"))
  );
  return (nar) => {
    E.rring(r)(ring(oh)(nar))(ob);
    ob.end();
    oh.end();
  };
}
