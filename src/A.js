// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N, N1 } from "./NP";
import * as E from "./E.js";
import type { Eo } from "./E.js";
import * as R from "./R.js";
import type { Ro } from "./R.js";

export type Ao<T> = Avalue<T> | Aelement<T> | Eo | N1<Ao<T>, Element>;
export type Avalue<+T> = {| _: "Avalue", +v: T |};
export type Aelement<T> = {|
  _: "Aelement",
  v: {
    tag: string,
    key?: string,
    nar: N1<Ao<T>, Element>,
  },
|};
export function value<T>(v: T): N<Avalue<T>> {
  const vAvalue = { _: "Avalue", v };
  return (o) => o(vAvalue);
}
export function element<T>(
  tag: string,
  nar: N1<Ao<T>, Element>,
  key?: string
): N<Aelement<T>> {
  const vAelement = { _: "Aelement", v: { tag, nar, key } };
  return (o) => o(vAelement);
}
export function ring<S>(Avalueo: P<Avalue<S>>): (N<Ao<S>>) => N<Eo> {
  return (nar) => (Eo) => {
    nar(function Ao(x) {
      if ("function" === typeof x) {
        Eo(function nar(o, elm) {
          x(Ao, elm);
        });
      } else if ("Avalue" === x._) {
        Avalueo(x);
      } else if ("Aelement" === x._) {
        E.element(
          x.v.tag,
          (Eo, elm) => ring(Avalueo)((Ao) => x.v.nar(Ao, elm))(Eo),
          x.v.key
        )(Eo);
      } else {
        Eo(x);
      }
    });
  };
}
export function make<T>(Avalueo: P<Avalue<T>>, elm: Element): P<Ao<T>> {
  const Eo = E.make(elm);
  var Ao;
  ring(Avalueo)(function Rmake_nar(Ao_) {
    Ao = Ao_;
  })(Eo);
  return function (x) {
    Ao(x);
  };
}
