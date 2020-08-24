// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N, N1 } from "./NP";
import * as E from "./E.js";
import type { Eo } from "./E.js";
import * as R from "./R.js";
import type { Ro } from "./R.js";

var state = {};
const o = R.make((r) => {
  state = r.v(state);
}, (document.body = document.createElement("body")));
const nar = (o) => {
  R.element("button", (Ro, elm) => {
    E.text("+")(Ro);
  })(o);

  R.element("button", (Ro, elm) => {
    E.text("+")(Ro);
  })(o);

  E.end()(o);
};
nar(o);
nar(o);
nar(o);
