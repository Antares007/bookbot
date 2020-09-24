// @flow strict
const nar = (o) => {
  o.error(new Error("hmmmm"));
  o.log("hello bro!");
  o.value(2);
};
const then = (f) => (nar) => (o) =>
  nar({
    ...o,
    value(v) {
      f(o, v);
      //      o.value(f(v));
    },
  });
const nar2 = then((o, v) => o.value(v + 100))(nar);

nar2({
  error(e) {},
  log(_) {},
  value(v) {
    console.log(v);
  },
});

const _nar = (cb) => cb(null, 1);
const _then = (f) => (nar) => (o) =>
  nar((e, v) => {
    if (e) o(e);
    else o(null, f(v));
  });
const _nar2 = _then((v) => v + "")(_nar);

_nar2((e, v) => {
  if (e) console.log(e);
  else console.log(v);
});
