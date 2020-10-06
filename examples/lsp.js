// @flow strict
const { spawn } = require("child_process");
function makePith(o) {
  const ls = spawn("flow", [
    "lsp",
    "--lazy-mode",
    "ide",
    "--flowconfig-name",
    "../.flowconfig",
  ]);
  var active = true;
  const end = () => {
    if (!active) return;
    active = false;
    try {
      ls.kill();
    } catch (_) {}
  };
  ls.stdout.on("data", function rec(data: Buffer) {
    try {
      const ContentLength = "Content-Length: ";
      var off = data.indexOf(ContentLength, 0);
      const length = parseInt(
        data.toString(
          "binary",
          (off = off + ContentLength.length),
          (off = data.indexOf("\r\n", off))
        ),
        10
      );
      const body = data.toString(
        "utf8",
        (off = data.indexOf("\r\n\r\n", off) + 4),
        (off = off + length)
      );
      o.value(JSON.parse(body));
      if (off < data.length) rec(data.slice(off));
    } catch (err) {
      o.error(err instanceof Error ? err : new Error(err && err.message));
      end();
    }
  });
  ls.stderr.on(
    "data",
    (data) => (o.error(new Error("aaaa" + data?.toString())), end())
  );
  ls.on("close", end);
  var i = 0;
  return {
    write(method: string, params: { ... }) {
      const b = JSON.stringify({ jsonrpc: "2.0", id: i++, method, params });
      ls.stdin.write(`Content-Length: ${b.length}\r\n\r\n` + b);
    },
    end,
  };
}
const o = makePith({
  error(e) {
    console.error(e);
  },
  value(v) {
    const m = require("util").inspect(v, { depth: 4, colors: true });
    console.log(m);
  },
});

var i = 0;
const hover = (uri: string, line: number, character: number) => {
  return o.write("textDocument/hover", {
    textDocument: { uri },
    position: { line, character },
    workDoneToken: "abo",
  });
};
const definition = (uri: string, line: number, character: number) => {
  return o.write("textDocument/definition", {
    textDocument: { uri },
    position: { line, character },
  });
};
const open = (uri: string, text: string) => {
  return o.write("textDocument/didOpen", {
    textDocument: { uri, text },
  });
};
o.write("initialize", {
  processId: process.pid,
  workDoneToken: 99,
  rootUri: __dirname,
});
var i = 0;
var id = setInterval(() => {
  hover("file:///home/antares/repos/bookbot/examples/lsp.js", 1, 10);
  hover("file:///home/antares/repos/bookbot/examples/lsp.js", 66, 9);
  hover("file:///home/antares/repos/bookbot/examples/lsp.js", 59, 9);
  hover("file:///home/antares/repos/bookbot/examples/lsp.js", 72, 9);
  if (i++ > 1) {
    clearInterval(id);
    o.end();
  }
}, 3000);
