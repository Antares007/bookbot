const { B, C } = require("./abc");
const nfs = require("fs");
const fs = B(
  ({ s: [t = "readdir", path] }) => (o) =>
    nfs[t](path, (e, ...args) => (e ? C(o, "error", e) : C(o, ...args))),
  ({ s: [t = "open", path, flags] }) => (o) =>
    nfs[t](path, flags, (e, ...args) => (e ? C(o, "error", e) : C(o, ...args))),
  ({ s: [t = "read"], n: [fd, offset, length, position], o: [buffer] }) => (
    o
  ) =>
    nfs[t](fd, buffer, offset, length, position, (e, ...args) =>
      e ? C(o, "error", e) : C(o, ...args)
    ),
  ({ s: [t = "close"], n: [fd] }) => (o) =>
    nfs[t](fd, (e, ...args) => (e ? C(o, "error", e) : C(o, ...args))),
  ({ s: [t = "readFile", path] }) => (o) =>
    nfs[t](path, (e, ...args) => (e ? C(o, "error", e) : C(o, ...args)))
);
module.exports = fs
