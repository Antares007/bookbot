// @flow strict
import type { P, N } from "./NP";

export type Ddispose = {| _: "Ddispose", v: () => void |};

export type Do = Ddispose | void | N<Do>;

export function dispose(v: () => void): N<Ddispose> {
  const dispose = { _: "Ddispose", v };
  return (o) => o(dispose);
}
export function make(): (Do) => void {
  var count = 0;
  const list: Array<Ddispose> = [];
  return function pith(x) {
    if (null == x) {
      const l = list.length - count;
      count = 0;
      for (let x of list.splice(count, l)) x.v();
    } else if ("function" === typeof x) {
      x(pith);
      pith();
    } else {
      const index = count++;
      const l = list.length;
      for (let i = index; i < l; i++)
        if (list[i] === x) {
          if (index < i) list.splice(index, 0, ...list.splice(i, 1));
          return;
        }
      list.splice(index, 0, x);
    }
  };
}
