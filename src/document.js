// @flow strict
import type { N } from "./purry";
import type { element_pith_t } from "./element";
const element = require("./element");
const rring = require("./rring");
const apiring = require("./apiring");

export type pith_t<S> = {|
  ...apiring.apiring_pith_t,
  ...rring.rring_pith_t<S>,
  head: N<N<element_pith_t>>,
  element: N<string, N<pith_t<S>>, ?string>,
|};
export function ring<S: { ... }>(
  oh: element_pith_t,
  r: N<(S) => S>
): (N<pith_t<S>>) => N<element_pith_t> {
  return (nar) => (op) =>
    apiring.oring((oa) =>
      rring.ring(r)((ob) =>
        nar({
          ...oa,
          ...ob,
          head(nar) {
            nar(oh);
          },
          element(sel, nar, key) {
            op.element(sel, ring(oh, r)(nar), key);
          },
        })
      )(op)
    )(op);
}
export function bark<S: { ... }>(r: N<(S) => S>): N<N<pith_t<S>>> {
  const hb = element.bark(
    document.head || (document.head = document.createElement("head"))
  );
  const ob = element.bark(
    document.body || (document.body = document.createElement("body"))
  );
  return (nar) => {
    hb((o) => ob(ring(o, r)(nar)));
  };
}
