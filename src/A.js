// @flow strict
import type { P, N } from "./NP";
import type { Do } from "./D.js";

export type Ao<T> = Do | Avalue<T> | N<Ao<T>>;
export type Avalue<+T> = {| _: "Avalue", +v: T |};
export function value<T>(v: T): N<Avalue<T>> {
  const vAvalue = { _: "Avalue", v };
  return (o) => o(vAvalue);
}
export function ring<T>(Avalueo: P<Avalue<T>>): (N<Ao<T>>) => N<Do> {
  return function (nar) {
    return (o) => {
      nar(function Ao(x) {
        if ("function" === typeof x) {
          o(ring(Avalueo)(x));
        } else if (x && "object" === typeof x && x._ === "Avalue") {
          Avalueo(x);
        } else {
          o(x);
        }
      });
    };
  };
}
export function map<A: { ... }, B>(f: (A) => B): (N<Ao<A>>) => N<Ao<B>> {
  return function (nar) {
    return (o) => {
      nar(function Ao(x) {
        if ("function" === typeof x) {
          o(map(f)(x));
        } else if ("object" === typeof x && x && x._ === "Avalue") {
          o({ _: "Avalue", v: f(x.v) });
        } else {
          o(x);
        }
      });
    };
  };
}
