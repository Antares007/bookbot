// @flow strict
function nar(o) {
  o({ _: ("action": "action"), v: nar });
  o({ _: ("dispose": "dispose"), v: () => {} });
  o({ _: ("end": "end") });
}

function make() {
  var actions_count = 0;
  const actions = [];
  return function pith(x) {
    if ("action" === x._) {
      x;
      //     const index = actions_count++;
      //     const l = actions.length;
      //     for (let i = index; i < l; i++)
      //       if (actions[i][0] === x) {
      //         if (index < i) {
      //           actions.splice(index, 0, ...actions.splice(i, 1));
      //         }
      //         return;
      //       }
      //     actions.splice(index, 0, [x, x.v]);
    } else if ("dispose" === x._) {
      x;
    } else if ("end" === x._) {
      //     const l = actions.length - actions_count;
      //     const rez = actions.splice(actions_count, l);
      //     actions_count = 0;
      //     for (let [x, d] of rez) d && d();
    } else {
      (x: empty);
      throw new Error("A");
    }
  };
}
if (false) nar(make());
