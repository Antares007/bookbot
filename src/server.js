// @flow strict
import * as http from "http";
import * as fs from "fs";

const s = http.createServer((req, res) => {
  if ("GET" === req.method) res.end(req.method);
  else (req.statusCode = 404), res.end();
});
s.listen(8080);

function r(req, res) {
  res(
    1,
    2,
    3
  )((o) => {
    o("hello");
  });
}
function ring(h) {
  return (req) => (o) => {
    h(req)((t) => {
      o("A");
      o(t);
      o("B");
    });
  };
}
