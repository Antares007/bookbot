// @flow strict
export type pith_t<
  L = void,
  R = void,
  S = void,
  T = void,
  U = void,
  V = void,
  X = void,
  Y = void,
  Z = void
> = {
  error: (L) => void,
  value: (R, S, T, U, V, X, Y, Z) => void,
};
export function purry<A, B, C, D, E, F, G, H, L, M, R, S, T, U, V, X, Y, Z>(
  narf: (pith_t<L, A, B, C, D, E, F, G, H>) => void,
  narg: (A, B, C, D, E, F, G, H) => (pith_t<M, R, S, T, U, V, X, Y, Z>) => void
): (pith_t<L | M, R, S, T, U, V, X, Y, Z>) => void {
  return (o) =>
    narf({
      ...o,
      value: (r, s, t, u, v, x, y, z) => narg(r, s, t, u, v, x, y, z)({ ...o }),
    });
}
export function pcatch<
  La,
  Lb,
  Ra,
  Sa,
  Ta,
  Ua,
  Va,
  Xa,
  Ya,
  Za,
  Rb,
  Sb,
  Tb,
  Ub,
  Vb,
  Xb,
  Yb,
  Zb
>(
  narf: (pith_t<La, Ra, Sa, Ta, Ua, Va, Xa, Ya, Za>) => void,
  narg: (La) => (pith_t<Lb, Rb, Sb, Tb, Ub, Vb, Xb, Yb, Zb>) => void
): (
  pith_t<
    Lb,
    Ra | Rb,
    Sa | Sb,
    Ta | Tb,
    Ua | Ub,
    Va | Vb,
    Xa | Xb,
    Ya | Yb,
    Za | Zb
  >
) => void {
  return (o) =>
    narf({
      ...o,
      error(e) {
        narg(e)({ ...o });
      },
    });
}
export function all<L, R, S, T, U, V, X, Y, Z>(
  nars: Array<(pith_t<L, R, S, T, U, V, X, Y, Z>) => void>
): (pith_t<L, Array<[R, S, T, U, V, X, Y, Z]>>) => void {
  return (o) => {
    var done = false;
    var l = nars.length;
    const rs: Array<[R, S, T, U, V, X, Y, Z]> = Array(l);
    if (l === 0) return o.value(rs);
    nars.forEach((nar, i) => {
      if (done) return;
      nar({
        error(e) {
          if (done) return;
          done = true;
          o.error(e);
        },
        value(r, s, t, u, v, x, y, z) {
          if (done) return;
          rs[i] = [r, s, t, u, v, x, y, z];
          if (--l === 0) o.value(rs);
        },
      });
    });
  };
}
export class RaceError extends Error {}
export function race<L, R, S, T, U, V, X, Y, Z>(
  nars: Array<(pith_t<L, R, S, T, U, V, X, Y, Z>) => void>
): (pith_t<L | RaceError, R, S, T, U, V, X, Y, Z>) => void {
  return nars.length === 0
    ? (o) => o.error(new RaceError("p.race(nars)\tnars.length === 0"))
    : (o) => {
        var l = nars.length;
        var done = false;
        nars.forEach((nar, i) => {
          if (done) return;
          nar({
            error(e) {
              if (done) return;
              if (--l === 0) o.error(e);
            },
            value(r, s, t, u, v, x, y, z) {
              if (done) return;
              done = true;
              o.value(r, s, t, u, v, x, y, z);
            },
          });
        });
      };
}
export function trycatch<L, R, S, T, U, V, X, Y, Z>(
  nar: (pith_t<L, R, S, T, U, V, X, Y, Z>) => void
): (pith_t<L | Error, R, S, T, U, V, X, Y, Z>) => void {
  return (o) => {
    try {
      nar({ ...o });
    } catch (e) {
      if (e instanceof Error) o.error((e: Error));
      else o.error(new Error(e && e.message));
    }
  };
}

export function onceguard<L, R, S, T, U, V, X, Y, Z>(
  nar: (pith_t<L, R, S, T, U, V, X, Y, Z>) => void
): (pith_t<L, R, S, T, U, V, X, Y, Z>) => void {
  return (o) => {
    var count = 0;
    nar({
      ...o,
      error(e) {
        if (count++ === 0) o.error(e);
      },
      value(r, s, t, u, v, x, y, z) {
        if (count++ === 0) o.value(r, s, t, u, v, x, y, z);
      },
    });
  };
}
export function liftcb0<
  L = void,
  R = void,
  S = void,
  T = void,
  U = void,
  V = void,
  X = void,
  Y = void,
  Z = void
>(
  cbf: ((e: ?L, R, S, T, U, V, X, Y, Z) => void) => void
): (pith_t<L, R, S, T, U, V, X, Y, Z>) => void {
  return (o) =>
    cbf((lm, r, s, t, u, v, x, y, z) =>
      lm ? o.error(lm) : o.value(r, s, t, u, v, x, y, z)
    );
}
export function liftcb1<
  A,
  L = void,
  R = void,
  S = void,
  T = void,
  U = void,
  V = void,
  X = void,
  Y = void,
  Z = void
>(
  cbf: (A, (e: ?L, R, S, T, U, V, X, Y, Z) => void) => void
): (A) => (pith_t<L, R, S, T, U, V, X, Y, Z>) => void {
  return (a) => (o) =>
    cbf(a, (lm, r, s, t, u, v, x, y, z) =>
      lm ? o.error(lm) : o.value(r, s, t, u, v, x, y, z)
    );
}
export function liftcb2<
  A,
  B,
  L = void,
  R = void,
  S = void,
  T = void,
  U = void,
  V = void,
  X = void,
  Y = void,
  Z = void
>(
  cbf: (A, B, (e: ?L, R, S, T, U, V, X, Y, Z) => void) => void
): (A, B) => (pith_t<L, R, S, T, U, V, X, Y, Z>) => void {
  return (a, b) => (o) =>
    cbf(a, b, (lm, r, s, t, u, v, x, y, z) =>
      lm ? o.error(lm) : o.value(r, s, t, u, v, x, y, z)
    );
}
export function liftcb3<
  A,
  B,
  C,
  L = void,
  R = void,
  S = void,
  T = void,
  U = void,
  V = void,
  X = void,
  Y = void,
  Z = void
>(
  cbf: (A, B, C, (e: ?L, R, S, T, U, V, X, Y, Z) => void) => void
): (A, B, C) => (pith_t<L, R, S, T, U, V, X, Y, Z>) => void {
  return (a, b, c) => (o) =>
    cbf(a, b, c, (lm, r, s, t, u, v, x, y, z) =>
      lm ? o.error(lm) : o.value(r, s, t, u, v, x, y, z)
    );
}
export function liftcb4<
  A,
  B,
  C,
  D,
  L = void,
  R = void,
  S = void,
  T = void,
  U = void,
  V = void,
  X = void,
  Y = void,
  Z = void
>(
  cbf: (A, B, C, D, (e: ?L, R, S, T, U, V, X, Y, Z) => void) => void
): (A, B, C, D) => (pith_t<L, R, S, T, U, V, X, Y, Z>) => void {
  return (a, b, c, d) => (o) =>
    cbf(a, b, c, d, (lm, r, s, t, u, v, x, y, z) =>
      lm ? o.error(lm) : o.value(r, s, t, u, v, x, y, z)
    );
}
export function liftcb5<
  A,
  B,
  C,
  D,
  E,
  L = void,
  R = void,
  S = void,
  T = void,
  U = void,
  V = void,
  X = void,
  Y = void,
  Z = void
>(
  cbf: (A, B, C, D, E, (e: ?L, R, S, T, U, V, X, Y, Z) => void) => void
): (A, B, C, D, E) => (pith_t<L, R, S, T, U, V, X, Y, Z>) => void {
  return (a, b, c, d, e) => (o) =>
    cbf(a, b, c, d, e, (lm, r, s, t, u, v, x, y, z) =>
      lm ? o.error(lm) : o.value(r, s, t, u, v, x, y, z)
    );
}
