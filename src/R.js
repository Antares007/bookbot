// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N, N1 } from "./NP";
import * as E from "./E.js";
import type { Eo } from "./E.js";

export type Ro<S> = Rreduce<S> | Relement<S> | Eo;

export type Rreduce<S> = {| _: "Rreduce", v: (S) => S |};
export type Relement<S> = {|
  _: "Relement",
  v: {
    tag: string,
    key?: string,
    nar: N1<Ro<S>, Element>,
  },
|};
export function reduce<S>(v: (S) => S): N<Rreduce<S>> {
  const Rreduce = { _: "Rreduce", v };
  return (o) => o(Rreduce);
}
export function element<S>(
  tag: string,
  nar: N1<Ro<S>, Element>,
  key?: string
): N<Relement<S>> {
  const Relement = { _: "Relement", v: { tag, nar, key } };
  return (o) => o(Relement);
}
export function ring<S>(Ro: P<Rreduce<S>>): (N<Ro<S>>) => N<Eo> {
  return (nar) => (Eo) => {
    nar(function pith(x) {
      if ("Rreduce" === x._) {
        Ro(x);
      } else if ("Relement" === x._) {
        E.element(
          x.v.tag,
          (Eo, elm) => ring(Ro)((Ro) => x.v.nar(Ro, elm))(Eo),
          x.v.key
        )(Eo);
      } else {
        Eo(x);
      }
    });
  };
}
