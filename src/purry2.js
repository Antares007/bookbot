// @flow strict
export type N<-A = void> = (A) => void;
export type LR<+L, +R> = {| +m: "left", +v: L |} | {| +m: "right", +v: R |};
export function purry<L1, L2, R1, R2>(
  narf: N<N<LR<L1, R1>>>,
  narg: (R1) => N<N<LR<L2, R2>>>
): N<N<LR<L1 | L2, R2>>> {
  return (o) => narf((r) => (r.m === "right" ? narg(r.v)(o) : o(r)));
}
purry(
  (o) => {
    o({ m: "right", v: 1 });
    o({ m: "left", v: true });
  },
  (a) => (o) => {
    o({ m: "left", v: "" });
    o({ m: "right", v: new Date() });
  }
)((r) => {});
declare var x:{+type:'abo'}|{type?:void}
if(x.type === 'abo'){x} else {x}
