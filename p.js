// @flow strict
import * as a from "./a";
import * as id from "./lib/id";

const pstr = (match) => (input, o) => {
  if (match.length > input.length) return o(input.length - match.length);
  const loop = (i) => {
    if (i === match.length) return o(i);
    if (match[i] !== input[i]) return o(-1 - i);
    if (i < match.length) return loop(i + 1);
    throw new Error("empty");
  };
  loop(0);
};
const purry = (f, g) => (input, o) =>
  f(input, (a) => (a < 0 ? o(a) : g(a)(input, o)));

purry(pstr("0"), (len) => (input, o) => {
  pstr("1")(input.slice(len), (a) => {
    if (a < 0) return o(a);
    if (true) return o(a + len);
  });
})(
  "012\t\t", console.log.bind(console)
);

function Bolk(lines: Array<string>, depth: number = 0) {
  return (o) => {
    console.log("= length " + lines.length);
    console.log("= lines " + lines.join(","));

    if (lines.length === 0)
      o((s) => {
        return {
          type: "Bolk",
          body: [],
        };
      });
    const depth = [];
    let spacecount = 0;
    let pos = 0;
    const code = lines[0];
    while (pos < code.length) {
      if (code.charCodeAt(pos) === 0x09) {
        depth.push(pos + 1);
        spacecount = 0;
      } else if (code.charCodeAt(pos) === 0x20) {
        if (spacecount === 3) {
          depth.push(pos + 1);
          spacecount = 0;
        } else spacecount++;
      } else break;
      pos++;
    }
    //var pos = blokstart;
    //while (pos < code.length) {
    //  const start = pos;
    //  const depth = [];
    //  let spacecount = 0;
    //  while (pos < code.length) {
    //    if (code.charCodeAt(pos) === 0x09) {
    //      depth.push(pos + 1);
    //      spacecount = 0;
    //    } else if (code.charCodeAt(pos) === 0x20) {
    //      if (spacecount === 3) {
    //        depth.push(pos + 1);
    //        spacecount = 0;
    //      } else spacecount++;
    //    } else break;
    //    pos++;
    //  }
    //  const prepos = pos;
    //  while (pos < code.length && code.charCodeAt(pos) !== 0x0a) pos++;
    //  const isEmpty = prepos === pos;
    //  const end = pos++;
    //  console.log(
    //    `${start}\t${end}\t${depth}\t${isEmpty}\t` +
    //      JSON.stringify(code.slice(start, end))
    //  );
    //}
  };
}
const code = `
        
		
 a
	1
   	 	2`.split(/\n/);

console.log(code);

let rezult;
Bolk(code)((r) => (rezult = r(rezult)));
console.log("state:", rezult);
