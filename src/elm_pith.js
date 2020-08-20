// @flow strict
import { static_cast } from "./static_cast.js";
export opaque type Oelm<S, A> = {|
  _: "elm",
  ctor: () => Element,
  eq: (Node) => ?Element,
  bark: ((O<S, A>) => void) => void,
|};
export opaque type Odispose = {| _: "dispose", dispose: () => void |};
export opaque type Oaction<S, A> = {|
  _: "action",
  a: ((O<S, A>) => void, Element) => void,
  dispose: () => void,
|};
export opaque type Oa<A> = {|
  _: "a",
  a: A,
|};
export opaque type Oon<S, A> = {|
  _: "on",
  on: ((O<S, A>) => void, A) => void,
|};
export type O<S, A> =
  | void
  | string
  | ((S) => S)
  | Oelm<S, A>
  | Oon<S, A>
  | Oaction<S, A>
  | Odispose
  | Oa<A>;
export function empty<T>(_: T) {}
export function makeElementPith<S, A>(
  o: (((S) => S) | Oa<A>) => void,
  elm: Element,
  depth: number = 0
): (O<S, A>) => void {
  var childs_count = 0;
  const { childNodes } = elm;
  const childPiths = [];
  var actions_count = 0;
  const actions = [];
  var handlers_count = 0;
  const handlers = [];
  var disposables_count = 0;
  const disposables = [];
  return function pith(x) {
    if (typeof x === "function") {
      console.info("P" + depth, elm.nodeName, [x.toString()]);
      o(x);
    } else {
      console.info("P" + depth, elm.nodeName, x);
      if (x == null) {
        let rez, l;
        let tmp = [];
        for (l = childNodes.length; l > childs_count; l--)
          tmp.push(elm.removeChild(childNodes[childs_count]));

        l = childPiths.length - childs_count;
        rez = childPiths.splice(childs_count, l);
        for (let x of rez) x();
        childs_count = 0;

        l = handlers.length - handlers_count;
        rez = handlers.splice(handlers_count, l);
        handlers_count = 0;

        l = disposables.length - disposables_count;
        rez = disposables.splice(disposables_count, l);
        for (let x of rez) x.dispose();
        disposables_count = 0;

        l = actions.length - actions_count;
        rez = actions.splice(actions_count, l);
        for (let x of rez) x.dispose();
        actions_count = 0;
      } else if (typeof x === "string") {
        const index = childs_count++;
        const l = childNodes.length;
        for (let i = index; i < l; i++)
          if (childNodes[i].nodeType === 3 && childNodes[i].textContent === x) {
            if (index < i) {
              elm.insertBefore(childNodes[i], childNodes[index]);
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
            }
            return;
          }
        elm.insertBefore(document.createTextNode(x), childNodes[index]);
        childPiths.splice(index, 0, empty);
      } else if (x._ === "elm") {
        const index = childs_count++;
        const l = childNodes.length;
        for (let i = index; i < l; i++)
          if (x.eq(childNodes[i])) {
            if (index < i) {
              elm.insertBefore(childNodes[i], childNodes[index]);
              childPiths.splice(index, 0, ...childPiths.splice(i, 1));
            }
            x.bark(childPiths[index]);
            return;
          }
        const child = elm.insertBefore(x.ctor(), childNodes[index]);
        const ob = makeElementPith(
          ((handlers_count) => (x) => {
            if (typeof x === "function") {
              o(x);
            } else {
              for (let i = 0; i < handlers_count; i++)
                handlers[i].on(pith, x.a);
            }
          })(handlers_count),
          child,
          depth + 1
        );
        childPiths.splice(index, 0, ob);
        x.bark(ob);
      } else if (x._ === "action") {
        const index = actions_count++;
        const l = actions.length;
        for (let i = index; i < l; i++)
          if (actions[i] === x) {
            if (index < i) {
              actions.splice(index, 0, ...actions.splice(i, 1));
            }
            return;
          }
        actions.splice(index, 0, x);
        x.a(pith, elm);
      } else if (x._ === "on") {
        const index = handlers_count++;
        const l = handlers.length;
        for (let i = index; i < l; i++)
          if (handlers[i] === x) {
            if (index < i) {
              handlers.splice(index, 0, ...handlers.splice(i, 1));
            }
            return;
          }
        handlers.splice(index, 0, x);
      } else if (x._ === "a") {
        o(x);
      } else {
        const index = disposables_count++;
        const l = disposables.length;
        for (let i = index; i < l; i++)
          if (disposables[i] === x) {
            if (index < i) {
              disposables.splice(index, 0, ...disposables.splice(i, 1));
            }
            return;
          }
        disposables.splice(index, 0, x);
      }
    }
  };
}
export function elm<S, A>(
  tag: string,
  bark: ?((O<S, A>) => void) => void
): Oelm<S, A> {
  const TAG = tag.toUpperCase();
  return {
    _: "elm",
    ctor: () => document.createElement(TAG),
    eq: (n) => (n instanceof HTMLElement && n.nodeName === TAG ? n : null),
    bark: bark || (() => {}),
  };
}
export function action<S, A>(
  a: ((O<S, A>) => void, Element) => ?() => void
): Oaction<S, A> {
  var d;
  return {
    _: ("action": "action"),
    a: (o, elm) => {
      d = a(o, elm);
    },
    dispose: () => {
      d = d && d();
    },
  };
}
export function a<A>(a: A): Oa<A> {
  return { _: "a", a };
}
export function on<S, A>(on: ((O<S, A>) => void, A) => void): Oon<S, A> {
  return { _: "on", on };
}
export function dispose<S>(dispose: () => void): Odispose {
  return { _: ("dispose": "dispose"), dispose };
}
export function ext<A: { ... }, B, T>(
  key: string,
  b: B,
  bark: ((O<B, T>) => void) => void
): ((O<A, T>) => void) => void {
  return function ring(o: (O<A, T>) => void) {
    bark((x) => {
      if (typeof x === "function") {
        o((a) => {
          const ob = a[key] || b;
          const nb = x(ob);
          if (ob === nb) return a;
          return { ...a, [key]: nb };
        });
      } else if (typeof x !== "object") {
        o(x);
      } else if (x._ === "elm") {
        o({ ...x, bark: ext(key, b, x.bark) });
      } else if (x._ === "action") {
        o({
          ...x,
          a: (oa, elm) => ext(key, b, (o) => x.a(o, elm))(oa),
        });
      } else if (x._ === "on") {
        o({
          ...x,
          on: (oa, elm) => ext(key, b, (o) => x.on(o, elm))(oa),
        });
      } else {
        o(x);
      }
    });
  };
}
