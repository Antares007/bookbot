// @flow strict
function nard(o) {
  o({ _: ("action": "action"), v: nard });
  o({ _: ("dispose": "dispose"), v: () => {} });
  o({ _: ("end": "end") });
}
function makeD() {
  var count = 0;
  const list = [];
  return function pith(x) {
    if ("action" === x._) {
    } else if ("dispose" === x._) {
      const index = count++;
      const l = list.length;
      for (let i = index; i < l; i++)
        if (list[i] === x) {
          if (index < i) {
            list.splice(index, 0, ...list.splice(i, 1));
          }
          return;
        }
      list.splice(index, 0, x);
    } else if ("end" === x._) {
      const l = list.length - count;
      const rez = list.splice(count, l);
      count = 0;
      for (let r of rez) r.v();
    } else {
      (x: empty);
      throw new Error("A");
    }
  };
}

if (false) {
  const o = makeD();
  nard(o);
}
