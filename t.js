// @flow strict
const { coll: C, bolk: B } = require("./src/bolk");
const id = require("./lib/id");

const pid = B(function ({ s: [input], f: [o] }) {
  if (!id.isIdentifierStart(input.charCodeAt(0)))
    return C(o, "error", "not identifier start", input[0]);
  let i = 1;
  while (i < input.length && id.isIdentifierChar(input.charCodeAt(i))) i++;
  C(o, "pid", i);
});
const pspace = B(function ({ s: [input], f: [o] }) {
  if (input[0] === " ") C(o, "pspace", 1);
  else C(o, "error", "not a space", input[0]);
});
const pand = B(({ f: [...funs] }) =>
  B(function ({ s: [input], f: [o] }) {
    var i = 0;
    var len = 0;
    var tokens;
    const next = ()=>{
        if (i < funs.length) C(funs[i++], input.slice(len), pith);
        else C(o, "pand", len, tokens);
    }
    const pith = B(
      function ({ s: [t = "error", ...ss], ...rest }) {
        console.error(this);
      },
      function ({ s: [tok], n: [length] }) {
        len += length;
        tokens = tokens ? C((a) => a, tokens, tok, length): C(a=>a,tok,length);
        next()
      },
      function ({ s: [tok], n: [length], o: [r] }) {
        len += length;
        tokens = tokens? C((a) => a, tokens, r, tok, length):C((a) => a, r, tok, length);
        next()
      }
    );
    C(funs[i++], input, pith);
  })
);

const pith = B(
  function ({ s: [t = "error", ...ss], ...rest }) {
    console.error(this);
  },
  function ({ s: [tok], n: [length], ...rest }) {
    console.log(tok, length, rest);
  }
);
C(
  C(pand, C(pand, pid, pspace), C(pand, pid, pspace)),
  pith,
  "aaa bbb ccc ddd eee{_ა9d"
);
