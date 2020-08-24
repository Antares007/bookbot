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
export function ring<S>(Rreduceo: P<Rreduce<S>>): (N<Ro<S>>) => N<Eo> {
  return (nar: N<Ro<S>>) => (Eo: P<Eo>) => {
    nar(function Rring_pmap(x: Ro<S>) {
      if ("Rreduce" === x._) {
        Rreduceo(x);
      } else if ("Relement" === x._) {
        E.element(
          x.v.tag,
          function Rring_apply_elm(Eo, elm) {
            ring(Rreduceo)(function Rring_apply_elm_narRo(Ro) {
              x.v.nar(Ro, elm);
            })(Eo);
          },
          x.v.key
        )(Eo);
      } else {
        Eo(x);
      }
    });
  };
}
export function make<S>(Rreduceo: P<Rreduce<S>>, elm: Element): P<Ro<S>> {
  const Eo = E.makeElementPith(elm);
  var Ro;
  ring(Rreduceo)(function Rmake_nar(Ro_) {
    Ro = Ro_;
  })(Eo);
  return function (x) {
    Ro(x);
  };
}
