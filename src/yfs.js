// @flow strict
const p = require("./purry");
const fs = require("fs");
const git = require("./git");

export const yfs: git.fs_t = {
  readdir: p.liftcb1(fs.readdir),
  open: p.liftcb2(fs.open),
  read: p.liftcb5(fs.read),
  close: p.liftcb1(fs.close),
  readFile: p.liftcb1(fs.readFile),
};
