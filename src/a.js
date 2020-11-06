// @flow strict
import type { N } from "./purry";
export type element_rays_t =
  | {| m: "text", a: string |}
  | {|
      m: "element",
      a: {| tag: string, nar: N<N<element_rays_t>>, key?: ?string |},
    |}
  | {| m: "get", a: N<HTMLElement> |}
  | {| m: "end" |};
export type rring_rays_t<S> =
  | element_rays_t
  | {|
      m: "relement",
      a: {| tag: string, nar: N<N<rring_rays_t<S>>>, key?: ?string |},
    |}
  | {| m: "reduce", a: (S) => S |};

const ns = {
  bark<S>(r: N<(S) => S>, elm: HTMLElement): N<N<N<rring_rays_t<S>>>> {
    const o = pith(elm);
    const ring = ns.ring(r);
    return (nar) => (ring(nar)(o), o({ m: "end" }));
  },
  mmap<A: { ... }, B>(
    f: ((B) => B) => (A) => A
  ): (N<N<rring_rays_t<B>>>) => N<N<rring_rays_t<A>>> {
    return function map(nar) {
      return (o) =>
        nar((r) => {
          if (r.m === "relement")
            o({
              m: "relement",
              a: { ...r.a, nar: ns.mmap(f)(r.a.nar) },
            });
          else if (r.m === "reduce") o({ ...r, a: f(r.a) });
          else o(r);
        });
    };
  },
  rmap<A: { ... }, B>(o: N<(A) => A>): (string, B) => N<(B) => B> {
    return (key, init) =>
      function Ermap(rb) {
        o((a) => {
          const ob = a[key] || init;
          const nb = rb(ob);
          if (ob === nb) return a;
          const ns = { ...a, [key]: nb };
          if (eq(init, nb)) delete ns[key];
          return ns;
        });
      };
  },
  ring<S>(
    reduce: N<(S) => S>
  ): (N<N<rring_rays_t<S>>>) => N<N<element_rays_t>> {
    return function map(nar) {
      return function Erring(o) {
        nar((r) => {
          if (r.m === "relement") {
            o({
              m: "element",
              a: { ...r.a, nar: map(r.a.nar) },
            });
          } else if (r.m === "reduce") {
            reduce(r.a);
          } else o(r);
        });
      };
    };
  },
};
module.exports = ns;
function eq(a: mixed, b: mixed): boolean {
  return a === b
    ? true
    : a == null || b == null
    ? false
    : Array.isArray(a)
    ? Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => eq(v, b[i]))
    : a instanceof Date
    ? b instanceof Date && a.getTime() === b.getTime()
    : typeof a === "object"
    ? typeof b === "object" &&
      a.constructor === b.constructor &&
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every((k) => eq(a[k], b[k]))
    : false;
}
const see = (o: N<rring_rays_t<[number, string, boolean]>>) => {
  o({ m: "reduce", a: ([a, v, c]) => [a, v, c] });
  o({ m: "text", a: "hello" });
  o({
    m: "relement",
    a: {
      tag: "div",
      nar: (o) => {
        o({ m: "reduce", a: ([a, v, c]) => [a, v, c] });
      },
    },
  });
  o({ m: "get", a: (childdivelm) => {} });
  o({ m: "end" });
};
const { A, B, C } = require("./abc");
const mp = B(({ n: [depth], o: [elm] }) => {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  return B(
    ({ s: [t = "element", ...ss], f: [nar] }) => {},
    ({ s: [t = "get"], f: [f] }) => {
      f(elm);
    },
    ({ s: [text] }) => {},
    ({}) => {}
  );
});
function pith(elm: HTMLElement, depth: number = 0): N<element_rays_t> {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  return (r) => {
    if (r.m === "element") {
      let n, ob;
      const index = childs_count++;
      const tag = r.a.tag.toUpperCase();
      const nar = r.a.nar;
      const key = r.a.key;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (
          (n = childNodes[i]) &&
          n instanceof HTMLElement &&
          n.nodeName === tag &&
          (key == null || n.getAttribute("key") === key)
        ) {
          if (index < i)
            elm.insertBefore(n, childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));

          if ((ob = childPiths[index]))
            if (key != null) return;
            else return nar(ob), ob({ m: "end" });
          childPiths.splice(index, 0, (ob = pith(n, depth + 1)));
          return nar(ob), ob({ m: "end" });
        }
      n = document.createElement(tag);
      if (key != null) n.setAttribute("key", key);
      elm.insertBefore(n, childNodes[index]),
        childPiths.splice(index, 0, (ob = pith(n, depth + 1)));
      nar(ob), ob({ m: "end" });
    } else if (r.m === "text") {
      const index = childs_count++;
      for (let i = index, l = childNodes.length; i < l; i++)
        if (childNodes[i].nodeType === 3 && childNodes[i].textContent === r.a) {
          if (index < i)
            elm.insertBefore(childNodes[i], childNodes[index]),
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
          return;
        }
      elm.insertBefore(document.createTextNode(r.a), childNodes[index]),
        childPiths.splice(index, 0, null);
    } else if (r.m === "get") {
      r.a(elm);
    } else {
      for (let l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);
      const piths = childPiths.splice(
        childs_count,
        childPiths.length - childs_count
      );
      childs_count = 0;
      for (let mp of piths) mp && mp({ m: "end" });
    }
  };
}
