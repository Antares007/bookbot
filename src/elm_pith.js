// @flow strict
import { static_cast } from "./static_cast.js";

export type O<S> =
  | void
  | string
  | ((S) => S)
  | {|
      _: "elm",
      ctor: () => Element,
      eq: (Node) => ?Element,
      bark: ((O<S>) => void) => void,
    |}
  | {|
      _: "on",
      type: string,
      handler: EventHandler,
      options?: EventListenerOptionsOrUseCapture,
    |}
  | {|
      _: "action",
      a: ((O<S>) => void, Element) => void,
    |}
  | {| _: "dispose", dispose: () => void |};
export function empty<T>(_: T) {}
export function makeElementPith<S>(
  o: ((S) => S) => void,
  elm: Element
): (O<S>) => void {
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
      o(x);
    } else if (x == null) {
      let rez, l;
      for (l = childNodes.length; l > childs_count; l--)
        elm.removeChild(childNodes[childs_count]);

      l = childPiths.length - childs_count;
      rez = childPiths.splice(childs_count, l);
      if (rez.length) console.log("e_remove", rez);
      for (let x of rez) x();
      childs_count = 0;

      l = handlers.length - handlers_count;
      rez = handlers.splice(handlers_count, l);
      if (rez.length) console.log("h_remove", rez);
      for (let x of rez) elm.removeEventListener(x.type, x.handler);
      handlers_count = 0;

      l = disposables.length - disposables_count;
      rez = disposables.splice(disposables_count, l);
      if (rez.length) console.log("d_remove", rez);
      for (let x of rez) x.dispose();
      disposables_count = 0;

      l = actions.length - actions_count;
      rez = actions.splice(actions_count, l);
      if (rez.length) console.log("a_remove", rez);
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
      const ob = makeElementPith(o, child);
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
      elm.addEventListener(x.type, x.handler, x.options);
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
  };
}
export function elm<S>(
  tag: string,
  bark: ((O<S>) => void) => void
): {|
  _: "elm",
  ctor: () => Element,
  eq: (Node) => ?Element,
  bark: ((O<S>) => void) => void,
|} {
  const TAG = tag.toUpperCase();
  return {
    _: "elm",
    ctor: () => document.createElement(TAG),
    eq: (n) => (n instanceof HTMLElement && n.nodeName === TAG ? n : null),
    bark,
  };
}
export function action<S>(a: ((O<S>) => void, Element) => void) {
  return { _: ("action": "action"), a };
}
export function dispose<S>(dispose: () => void) {
  return { _: ("dispose": "dispose"), dispose };
}
// prettier-ignore
export const on = {
  contextmenu: (h: MouseEventHandler)    => ({ _:"on", type: 'contextmenu', handler: static_cast<EventHandler, *>(h) }),
  mousedown:   (h: MouseEventHandler)    => ({ _:"on", type: 'mousedown' , handler: static_cast<EventHandler, *>(h) }),
  mouseenter:  (h: MouseEventHandler)    => ({ _:"on", type: 'mouseenter', handler: static_cast<EventHandler, *>(h) }),
  mouseleave:  (h: MouseEventHandler)    => ({ _:"on", type: 'mouseleave', handler: static_cast<EventHandler, *>(h) }),
  mousemove:   (h: MouseEventHandler)    => ({ _:"on", type: 'mousemove', handler: static_cast<EventHandler, *>(h) }),
  mouseout:    (h: MouseEventHandler)    => ({ _:"on", type: 'mouseout', handler: static_cast<EventHandler, *>(h) }),
  mouseover:   (h: MouseEventHandler)    => ({ _:"on", type: 'mouseover', handler: static_cast<EventHandler, *>(h) }),
  mouseup:     (h: MouseEventHandler)    => ({ _:"on", type: 'mouseup', handler: static_cast<EventHandler, *>(h) }),
  click:       (h: MouseEventHandler)    => ({ _:"on", type: 'click', handler: static_cast<EventHandler, *>(h) }),
  dblclick:    (h: MouseEventHandler)    => ({ _:"on", type: 'dblclick', handler: static_cast<EventHandler, *>(h) }),
  blur:        (h: FocusEventHandler)    => ({ _:"on", type: 'blur', handler: static_cast<EventHandler, *>(h) }),
  focus:       (h: FocusEventHandler)    => ({ _:"on", type: 'focus', handler: static_cast<EventHandler, *>(h) }),
  focusin:     (h: FocusEventHandler)    => ({ _:"on", type: 'focusin', handler: static_cast<EventHandler, *>(h) }),
  focusout:    (h: FocusEventHandler)    => ({ _:"on", type: 'focusout', handler: static_cast<EventHandler, *>(h) }),
  keydown:     (h: KeyboardEventHandler) => ({ _:"on", type: 'keydown', handler: static_cast<EventHandler, *>(h) }),
  keyup:       (h: KeyboardEventHandler) => ({ _:"on", type: 'keyup', handler: static_cast<EventHandler, *>(h) }),
  keypress:    (h: KeyboardEventHandler) => ({ _:"on", type: 'keypress', handler: static_cast<EventHandler, *>(h) }),
  input:       (h: InputEventHandler)    => ({ _:"on", type: 'input', handler: static_cast<EventHandler, *>(h) }), 
  beforeinput: (h: InputEventHandler)    => ({ _:"on", type: 'beforeinput', handler: static_cast<EventHandler, *>(h) }),
};
export function ext<A: { ... }, B>(
  key: string,
  b: B,
  bark: ((O<B>) => void) => void
): ((O<A>) => void) => void {
  return function ring(o: (O<A>) => void) {
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
      } else {
        o(x);
      }
    });
  };
}
