// @flow strict
export type P<-O> = (O) => void;
export type N<+O> = (P<O>) => void;
export type N1<+O, -B> = (P<O>, B) => void;
