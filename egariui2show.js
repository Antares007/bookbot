const makeBark = require("./egariui2.js");
const button2 = (o, d, l) => {
  if (o.reduce) o.reduce("aba" + d + l);
  o.text(l);
  if (d) counter2(o, d - 1);
};
const counter2 = (o, d) => {
  if (o.reduce) o.reduce("abo" + d);
  o.relement("button", button2, d, "+");
  o.relement("button", button2, d, "-");
  o.text("0");
};
const ring = (nar) => (o, ...args) => {
  nar(
    {
      ...o,
      relement: (tag, nar, ...args) => o.element(tag, ring(nar), ...args),
      reduce: (r) => console.log(r),
    },
    ...args
  );
};
const body = makeBark((document.body = document.createElement("body")));
body.b(ring(counter2), 1);

Object.assign(window, { counter2 });
