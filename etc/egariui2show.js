const makeBark = require("./egariui2.js");
const button2 = (o, d, l) => {
  if (o.reduce2) o.reduce2("aba" + d + l);
  o.text(l);
  if (d) counter2(o, d - 1);
};
const counter2 = (o, d) => {
  if (o.reduce) o.reduce("abo" + d);
  o.on("click", (e) => {}, {});
  o.relement2("button", button2, d, "+");
  o.relement2("button", button2, d, "-");
  o.text("0");
};
const ring = (o, nar, ...args) => {
  nar(
    {
      ...o,
      relement: (tag, nar, ...args) => o.element(tag, ring, nar, ...args),
      reduce: (r) => console.log(r),
    },
    ...args
  );
};
console.log('avoe')
const ring2 = (o, nar, ...args) => {
  nar(
    {
      ...o,
      relement2: (tag, nar, ...args) => o.element(tag, ring2, nar, ...args),
      reduce2: (r) => console.log(r),
    },
    ...args
  );
};
const body = makeBark((document.body = document.createElement("body")));
body.o.b(ring2, ring, counter2, 1);

Object.assign(window, { counter2, ring2, ring });
