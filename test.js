const { B, C } = require("./src/abc");
const purry = require("./src/purry2");

const pith = B(
  function ({ s: [t = "error", ...ss], ...rest }) {
    console.error(this);
  },
  function () {
    console.info(this.type, require("util").inspect(this, { depth: 10 }));
  }
);
const fs = require("./src/fs");
const readRaw = require("./src/git2");
C(
  readRaw,
  "/home/antares/repos/bookbot/.git",
  fs,
  Buffer.from("c896db1bd515285d6417dfb84029171cad6ac849", "hex")
)(pith);
//ba0e9df9249004b421e7ef38b1112a8785c6582f
//const { join, dirname } = require("path");
//const readRef = B(({ s: [gitdir, ref], f: [fs] }) =>
//  C(
//    purry,
//    "catch",
//    C(
//      purry, //
//      C(fs, "readFile", join(gitdir, ref)),
//      ({ o: [b] }) => (o) => C(o, b.toString("binary", 0, 40))
//    ),
//    B(function ({ s: [t = "error", ...ss], o: [e] }) {
//      return (o) => {
//        if (e.code === "ENOENT")
//          C(
//            purry,
//            C(fs, "readFile", join(gitdir, "packed-refs")),
//            ({ o: [b] }) => (o) => {
//              const i = b.indexOf(ref);
//              if (i > 0) C(o, b.toString("binary", i - 41, i - 1));
//              else C(o, "error", `ref not found ${ref}`);
//            }
//          )(o);
//        else o(this);
//      };
//    })
//  )
//);
//
//C(readRef, "/home/antares/repos/bookbot/.git", "refs/heads/master", fs)(pith);

//const decoders = {
//  commit: decodeCommit,
//  tree: decodeTree,
//  blob: decodeBlob,
//  tag: decodeTag,
//};
//const read = B(({ s: [gitdir], o: [fs, hash] }) => {
//  return C(purry, C(readRaw, fs, gitdir, hash), (b, t) => decoders[t](b));
//});
//function decodeCommit(body: Buffer): N<p.pith_t<empty, commit_t>> {
//  var i = 0;
//  var key;
//  var tree = emptyTreeHash;
//  const parents = [];
//  var author = "";
//  var committer = "";
//  while ((key = body[i]) !== 0x0a) {
//    if (key === 112 /*parent*/) {
//      parents.push(body.toString("binary", (i += 7), (i += 40)));
//    } else if (key === 97 /*author*/) {
//      author = body.toString("utf8", (i += 7), (i = body.indexOf(0x0a, i)));
//    } else if (key === 99 /*committer*/) {
//      committer = body.toString("utf8", (i += 10), (i = body.indexOf(0x0a, i)));
//    } /*tree*/ else {
//      tree = body.toString("binary", (i += 5), (i += 40));
//    }
//    i++;
//  }
//  const message = body.toString("utf8", ++i);
//  return (o) =>
//    o.value({
//      type: "commit",
//      value: { tree, parents, author, committer, message },
//    });
//}
