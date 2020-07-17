// @flow strict
import type { S } from "./S";

declare class On {
  constructor(ets: S<Node>): void;
  event(name: string): S<Event>;
  click(): S<MouseEvent>;
  input(): S<InputEvent>;
}
