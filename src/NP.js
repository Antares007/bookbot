// @flow strict
export type P<-O> = (O) => void;
export type N<+O> = (P<O>) => void;

// type A = 1;
// type B = 2;
// type C = 3;

// declare var f: (A) => B;
// declare var g: (B) => C;
// var fg = (x: A) => g(f(x));
// declare var n1: ((A) => void) => void;

function nar2(o) {
  o(1);
  o(2);
  o("a");
  o(true);
  o(function nar2(o) {
    o(1);
    o(2);
    o("a");
    o(true);
  });
}
function makepith1(o) {
  var sum = 0;
  return function pith1(x) {
    if ("function" === typeof x) {
      x(pith1);
    } else if ("number" === typeof x) {
      o((sum += x));
    } else if ("string" === typeof x) {
      o((sum += x.length));
    } else {
      o((sum += x ? 1 : 0));
    }
  };
}
function pith2(x) {
  console.log(x);
}
nar2(makepith1(pith2));

// function n(o) {
//   o(1, 2, 3);
//   o(1, 2, 3);
//   o(1, 2, 3);
//   o(1, 2, 3);
//   o(1, 2, 3);
// }
