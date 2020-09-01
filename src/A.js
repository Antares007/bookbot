// @flow strict
function nargo(o) {
  o({ t: ("go": "go"), v: nargo });
  o({ t: ("dispose": "dispose"), v: () => {} });
  o({ t: ("end": "end") });
}
function makeNargosPith() {
  var nargos_count = 0;
  const nargos = [];
  const nargo_piths = [];
  var disposables_count = 0;
  const disposables = [];
  return function pith(r) {
    if ("go" === r.t) {
      const index = nargos_count++;
      const l = nargos.length;
      for (let i = index; i < l; i++)
        if (nargos[i] === r.v) {
          if (index < i) {
            nargos.splice(index, 0, ...nargos.splice(i, 1));
            nargo_piths.splice(index, 0, ...nargo_piths.splice(i, 1));
          }
          return;
        }
      const o = makeNargosPith();
      nargos.splice(index, 0, r.v);
      nargo_piths.splice(index, 0, o);
      r.v(o);
      o({ t: "end" });
    } else if ("dispose" === r.t) {
      const index = disposables_count++;
      const l = disposables.length;
      for (let i = index; i < l; i++)
        if (disposables[i] === r.v) {
          if (index < i) {
            disposables.splice(index, 0, ...disposables.splice(i, 1));
          }
          return;
        }
      disposables.splice(index, 0, r.v);
    } else if ("end" === r.t) {
      let l, rez;
      l = nargos.length - nargos_count;
      rez = nargos.splice(nargos_count, l);
      rez = nargo_piths.splice(nargos_count, l);
      nargos_count = 0;
      for (let r of rez) r({ t: "end" });

      l = disposables.length - disposables_count;
      rez = disposables.splice(disposables_count, l);
      disposables_count = 0;
      for (let r of rez) r();
    } else {
      (r: empty);
      throw new Error("A");
    }
  };
}

if (false) {
  nargo(makeNargosPith());
}
