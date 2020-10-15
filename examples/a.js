// @flow strict
import type { N } from "../src/purry";
import type { rring_rays_t } from "../src/a";
import * as ast from "../asttypes";
const a = require("../src/a");
const parse = require("../lib/babel");
var state = {};
const b = a.bark((r) => {
  state = r(state);
}, (document.body = document.body || document.createElement("body")));

function div<S>(
  nar: N<N<rring_rays_t<S>>>,
  key?: ?string
): {|
  m: "relement",
  a: {| tag: string, nar: N<N<rring_rays_t<S>>>, key?: ?string |},
|} {
  return { m: ("relement": "relement"), a: { tag: "div", nar, key } };
}
function reduce<S>(a: (S) => S): {| m: "reduce", a: (S) => S |} {
  return { m: ("reduce": "reduce"), a };
}
function DebuggerStatement(o: N<rring_rays_t<ast.DebuggerStatement>>) {}
function BlockStatement(o: N<rring_rays_t<ast.BlockStatement>>) {}
function Program(o: N<rring_rays_t<ast.Program>>) {
  o(
    reduce((s) => {
      s.body.forEach((n, i) => {
        if (n.type === "BlockStatement") {
          const type = n.type,
            nar = BlockStatement,
            init = { type, body: [] };
          // prettier-ignore
          o(div(
            a.ring((r) => o(reduce((s) => ({ ...s, body: s.body.map((s, k) => k !== i ? s : r(s.type === type ? s : init)), }))))(nar),
            "body" + i
          ));
        } else if (n.type === "DebuggerStatement") {
          const type = n.type,
            nar = DebuggerStatement,
            init = { type };
          // prettier-ignore
          o(div(
            a.ring((r) => o(reduce((s) => ({ ...s, body: s.body.map((s, k) => k !== i ? s : r(s.type === type ? s : init)), }))))(nar),
            "body" + i
          ));
        } else n;
      });
      return s;
    })
  );
}
function File(o: N<rring_rays_t<ast.File>>) {
  o(
    div(
      a.ring((r) => o(reduce((s) => ({ ...s, program: r(s.program) }))))(
        Program
      ),
      "program"
    )
  );
}

b((o) => {
  o({
    m: "reduce",
    a: (s) => {
      if (s == null) {
        o({ m: "text", a: "null" });
      } else if (typeof s.type === "string") {
        o({ m: "text", a: s.type });
      }
      console.log(s);
      return s;
    },
  });

  o({
    m: "relement",
    a: {
      tag: "button",
      nar: a.ring((r) => {
        r([]);
      })((o) => {
        o({ m: "text", a: "." });
        o({
          m: "reduce",
          a: (s) => s,
        });
      }),
    },
  });
});
