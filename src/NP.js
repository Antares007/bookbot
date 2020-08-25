// @flow strict
export type P<-O> = (O) => void;
export type N<+O> = (P<O>) => void;
