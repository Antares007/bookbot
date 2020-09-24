// @flow strict
const p = require("./p");
const fs = require("fs");
const read = require("./read");

export const yfs: read.fs_t = {
  readdir: p.liftcb1(fs.readdir),
  open: p.liftcb2(fs.open),
  read: p.liftcb5(fs.read),
  close: p.liftcb1(fs.close),
  readFile: p.liftcb1(fs.readFile),
};
