// @flow strict
import type { N } from "./p";
const E = require("./E");

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
  const hb = E.bark(
    document.head || (document.head = document.createElement("head"))
  );
  const ob = E.bark(
    document.body || (document.body = document.createElement("body"))
  );
  return (nar) => {
    hb((o) => ob(E.rring(r)(ring(o)(nar))));
  };
}
