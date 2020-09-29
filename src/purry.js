// @flow strict
export type N<
  -A = void,
  -B = void,
  -C = void,
  -D = void,
  -E = void,
  -F = void,
  -G = void,
  -H = void,
  -I = void
> = (A, B, C, D, E, F, G, H, I) => void;
export type pith_t<
  -L = void,
  -R = void,
  -S = void,
  -T = void,
  -U = void,
  -V = void,
  -X = void,
  -Y = void,
  -Z = void
> = {|
  +error: N<L>,
  +value: N<R, S, T, U, V, X, Y, Z>,
|};
export function purry<A, B, C, D, E, F, G, H, L, M, R, S, T, U, V, X, Y, Z>(
  narf: N<pith_t<L, A, B, C, D, E, F, G, H>>,
  narg: (A, B, C, D, E, F, G, H) => N<pith_t<M, R, S, T, U, V, X, Y, Z>>
): N<pith_t<L | M, R, S, T, U, V, X, Y, Z>> {
  return (o) =>
    narf({
      ...o,
      value: (r, s, t, u, v, x, y, z) => narg(r, s, t, u, v, x, y, z)(o),
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
  narf: N<pith_t<La, Ra, Sa, Ta, Ua, Va, Xa, Ya, Za>>,
  narg: (La) => N<pith_t<Lb, Rb, Sb, Tb, Ub, Vb, Xb, Yb, Zb>>
): N<
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
> {
  return (o) =>
    narf({
      ...o,
      error(e) {
        narg(e)(o);
      },
    });
}
export function all<L, R, S, T, U, V, X, Y, Z>(
  nars: Array<N<pith_t<L, R, S, T, U, V, X, Y, Z>>>
): N<pith_t<L, Array<[R, S, T, U, V, X, Y, Z]>>> {
  return (o) => {
    var done = false;
    var l = nars.length;
    const rs: Array<[R, S, T, U, V, X, Y, Z]> = Array(l);
    if (l === 0) return o.value(rs);
    nars.forEach((nar, i) => {
      if (done) return;
      nar({
        ...o,
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
  nars: Array<N<pith_t<L, R, S, T, U, V, X, Y, Z>>>
): N<pith_t<L | RaceError, R, S, T, U, V, X, Y, Z>> {
  return nars.length === 0
    ? (o) => o.error(new RaceError("p.race(nars)\tnars.length === 0"))
    : (o) => {
        var l = nars.length;
        var done = false;
        nars.forEach((nar, i) => {
          if (done) return;
          nar({
            ...o,
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
  nar: N<pith_t<L, R, S, T, U, V, X, Y, Z>>
): N<pith_t<L | Error, R, S, T, U, V, X, Y, Z>> {
  return (o) => {
    try {
      nar(o);
    } catch (e) {
      if (e instanceof Error) o.error((e: Error));
      else o.error(new Error(e && e.message));
    }
  };
}

export function onceguard<L, R, S, T, U, V, X, Y, Z>(
  nar: N<pith_t<L, R, S, T, U, V, X, Y, Z>>
): N<pith_t<L, R, S, T, U, V, X, Y, Z>> {
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
>(cbf: N<N<?L, R, S, T, U, V, X, Y, Z>>): N<pith_t<L, R, S, T, U, V, X, Y, Z>> {
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
  cbf: N<A, N<?L, R, S, T, U, V, X, Y, Z>>
): (A) => N<pith_t<L, R, S, T, U, V, X, Y, Z>> {
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
  cbf: N<A, B, N<?L, R, S, T, U, V, X, Y, Z>>
): (A, B) => N<pith_t<L, R, S, T, U, V, X, Y, Z>> {
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
  cbf: N<A, B, C, N<?L, R, S, T, U, V, X, Y, Z>>
): (A, B, C) => N<pith_t<L, R, S, T, U, V, X, Y, Z>> {
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
  cbf: N<A, B, C, D, N<?L, R, S, T, U, V, X, Y, Z>>
): (A, B, C, D) => N<pith_t<L, R, S, T, U, V, X, Y, Z>> {
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
  cbf: N<A, B, C, D, E, N<?L, R, S, T, U, V, X, Y, Z>>
): (A, B, C, D, E) => N<pith_t<L, R, S, T, U, V, X, Y, Z>> {
  return (a, b, c, d, e) => (o) =>
    cbf(a, b, c, d, e, (lm, r, s, t, u, v, x, y, z) =>
      lm ? o.error(lm) : o.value(r, s, t, u, v, x, y, z)
    );
}
