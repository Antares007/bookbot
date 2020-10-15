// @flow strict
import type { N } from "./purry";
import type { element_pith_t } from "./element";
const { static_cast } = require("./utils/static_cast");

export type apiring_pith_t = {|
  ...element_pith_t,
  element: N<string, N<apiring_pith_t>, ?string>,
  attr: N<string, ?string>,
  style: N<string, ?string>,
  prop: N<string, mixed>,
  on: N<string, N<Event>, ?EventListenerOptionsOrUseCapture>,
|};
export function oring(nar: N<apiring_pith_t>): N<element_pith_t> {
  return function Erring(o) {
    o.get((elm) => {
      const classList: Array<string> = [...elm.classList];
      nar({
        ...o,
        element(sel, nar, key) {
          o.element(sel, oring(nar), key);
        },
        attr(name, value_) {
          const value =
            name === "class"
              ? value_ == null
                ? classList.join(" ")
                : Object.keys(
                    classList.concat(value_.split(" ")).reduce((s, n) => {
                      s[n] = null;
                      return s;
                    }, {})
                  ).join(" ")
              : value_;
          if (value != null) {
            if (elm.getAttribute(name) !== value) elm.setAttribute(name, value);
          } else {
            if (elm.hasAttribute(name)) elm.removeAttribute(name);
          }
        },
        style(name, value) {
          if (value != null) {
            if (elm.style.getPropertyValue(name) !== value)
              elm.style.setProperty(name, value);
          } else {
            if (elm.style.getPropertyValue(name))
              elm.style.removeProperty(name);
          }
        },
        prop(name, value) {
          const m = (elm: { [string]: mixed });
          if (m[name] !== value) m[name] = value;
        },
        on(type, listener, options) {
          static_cast<N<string, N<Event>, ?EventListenerOptionsOrUseCapture>>(
            elm.addEventListener
          )(type, listener, options);
        },
      });
    });
  };
}
