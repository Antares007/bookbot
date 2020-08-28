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
  return (nar) => (o) => {
    nar(function Ao(x) {
      if ("function" === typeof x) {
        o(() => x(Ao));
      } else if (x && "object" === typeof x && x._ === "Avalue") {
        Avalueo(x);
      } else {
        o(x);
      }
    });
  };
}
export function map<A: { ... }, B>(f: (A) => B): (N<Ao<A>>) => N<Ao<B>> {
  return (nar) => (o) => {
    nar(function Ao(x) {
      if ("function" === typeof x) {
        o(() => x(Ao));
      } else if ("object" === typeof x && x && x._ === "Avalue") {
        o({ _: "Avalue", v: f(x.v) });
      } else {
        o(x);
      }
    });
  };
}
