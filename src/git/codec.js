// @flow strict
const p = require("../purry");
const fs = require("fs");
const pako = require("../../lib/pako");
const emptyTreeHash = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
export type mode_t = "40000" | "100644" | "100755" | "120000" | "160000";
export type object_t = 1 | 2 | 3 | 4;
export type commit_t = {|
  tree: string,
  parents: Array<string>,
  author: string,
  committer: string,
  message: string,
|};
export type tree_t = {| [string]: {| mode: mode_t, hash: Buffer |} |};
export type tag_t = {
  object: string,
  type: object_t,
  tag: string,
  tagger: string,
  message: string,
};
export function decodeCommit<E>(body: Buffer): (p.pith_t<E, commit_t>) => void {
  var i = 0;
  var key;
  var tree = emptyTreeHash;
  const parents = [];
  var author = "";
  var committer = "";
  while ((key = body[i]) !== 0x0a) {
    if (key === 112 /*parent*/) {
      parents.push(body.toString("binary", (i += 7), (i += 40)));
    } else if (key === 97 /*author*/) {
      author = body.toString("utf8", (i += 7), (i = body.indexOf(0x0a, i)));
    } else if (key === 99 /*committer*/) {
      committer = body.toString("utf8", (i += 10), (i = body.indexOf(0x0a, i)));
    } /*tree*/ else {
      tree = body.toString("binary", (i += 5), (i += 40));
    }
    i++;
  }
  const message = body.toString("utf8", ++i);
  return (o) => o.value({ tree, parents, author, committer, message });
}
export function decodeTree(buffer: Buffer): (p.pith_t<empty, tree_t>) => void {
  const length = buffer.length;
  const entries = {};
  var i = 0;
  while (i < length) {
    const mode = buffer.toString("binary", i, (i = buffer.indexOf(0x20, i)));
    const name = buffer.toString("utf8", ++i, (i = buffer.indexOf(0x00, i)));
    const hash = buffer.slice(++i, (i += 20));
    entries[name] = { mode, hash };
  }
  return (o) => o.value(entries);
}
export function decodeTag(buffer: Buffer): (p.pith_t<empty, tag_t>) => void {
  const tag = {};
  var i = 0;
  while (buffer[i] !== 0x0a)
    (tag[
      buffer.toString("binary", i, (i = buffer.indexOf(0x20, i)))
    ] = buffer.toString("utf8", ++i, (i = buffer.indexOf(0x0a, i)))),
      i++;
  i++;
  tag.message = buffer.toString("utf8", i, buffer.length);
  return (o) => o.value(tag);
}
function parseDec(buffer: Buffer, start: number, end: number) {
  var i = start;
  var size = 0;
  while (i < end) size = size * 10 + buffer[i++] - 0x30;
  return size;
}
