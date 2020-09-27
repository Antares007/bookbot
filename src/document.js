// @flow strict
import type { N } from "./p";
const E = require("./E3");

export type document_pith_t<S> = {
  head: N<N<E.o_pith_t>>,
  body: N<N<E.r_pith_t<S>>>,
  end: N<>,
};
export function pith<S: { ... }>(r: N<(S) => S>): document_pith_t<S> {
  const h = E.pith(
    document.head || (document.head = document.createElement("head"))
  );
  const b = E.pith(
    document.body || (document.body = document.createElement("body"))
  );
  return {
    head(nar) {
      nar(h);
    },
    body(nar) {
      E.rring(r)(nar)(b);
    },
    end() {
      h.end();
      b.end();
    },
  };
}
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
  const h = E.pith(
    document.head || (document.head = document.createElement("head"))
  );
  const b = E.pith(
    document.body || (document.body = document.createElement("body"))
  );
  return (nar) => {
    E.rring(r)(ring(h)(nar))(b);
    b.end();
    h.end();
  };
}
