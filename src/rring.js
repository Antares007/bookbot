// @flow strict
import type { N } from "./purry";
import type { element_pith_t } from "./element";

export type rring_pith_t<S> = {|
  ...element_pith_t,
  reduce: N<(S) => S>,
  element: N<string, N<rring_pith_t<S>>, ?string>,
|};

export function ring<S>(
  reduce: N<(S) => S>
): (N<rring_pith_t<S>>) => N<element_pith_t> {
  return (nar) =>
    function Erring(o) {
      nar({
        ...o,
        element(sel, nar, key) {
          o.element(sel, ring(reduce)(nar), key);
        },
        reduce,
      });
    };
}

export function rmap<A: { ... }, B>(
  o: N<(A) => A>
): (string, B) => N<(B) => B> {
  return (key, init) =>
    function Ermap(rb) {
      o((a) => {
        const ob = a[key] || init;
        const nb = rb(ob);
        if (ob === nb) return a;
        const ns = { ...a, [key]: nb };
        if (eq(init, nb)) delete ns[key];
        return ns;
      });
    };
}

function eq(a: mixed, b: mixed): boolean {
  return a === b
    ? true
    : a == null || b == null
    ? false
    : Array.isArray(a)
    ? Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => eq(v, b[i]))
    : a instanceof Date
    ? b instanceof Date && a.getTime() === b.getTime()
    : typeof a === "object"
    ? typeof b === "object" &&
      a.constructor === b.constructor &&
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every((k) => eq(a[k], b[k]))
    : false;
}
export function mmap<A: { ... }, B>(
  key: string,
  init: B
): (N<rring_pith_t<B>>) => N<rring_pith_t<A>> {
  return function map(nar) {
    return function Emmap(o) {
      nar({
        ...o,
        element(sel, nar, k) {
          o.element(sel, map(nar), k);
        },
        reduce: rmap(o.reduce)(key, init),
      });
    };
  };
}
