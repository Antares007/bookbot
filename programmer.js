module.exports = function programmer(t, ...args) {
  const ws = " \n\r\t";
  const toks = [];
  const n = (i) => "λ" + i.toString(16);
  var spos = 0,
    tpos = 0,
    apos = 0;
  var code = "";
  var j = 0;
  var i = 0;
  while (tpos < t.length) {
    let str = t[tpos];
    while (ws.includes(str[spos])) spos++;
    if (spos < str.length) {
      if ("A" <= str[spos] && str[spos] <= "Z") {
        let start = spos;
        do spos++;
        while (!ws.includes(str[spos]) && spos < str.length);
        const sym = str.slice(start, spos);
        while (ws.includes(str[spos])) spos++;
        if (str[spos] === "→") {
          spos++;
          toks.length && toks[toks.length - 1][0] !== "G" && toks.push(["G"]);
          toks.push(["C", sym]);
        } else toks.push(["A", sym]);
      } else {
        let start = spos;
        do spos++;
        while (!ws.includes(str[spos]) && spos < str.length);
        let term = str.slice(start, spos);
        if (term === "|" || term === "/")
          toks[toks.length - 1][0] !== "G" && toks.push(["G"]);
        else toks.push(["T", term]);
      }
    } else {
      tpos++;
      spos = 0;
      if (apos < args.length) toks.push(["G", apos++]);
      else toks[toks.length - 1][0] !== "G" && toks.push(["G"]);
    }
  }
  while (i < toks.length) {
    const name = toks[i][0] === "C" ? toks[i++][1] : n(j);
    const mol = toks[i][0];
    const head =
      toks[i][0] === "G"
        ? typeof toks[i][1] === "number"
          ? `_[${toks[i][1]}]`
          : "__"
        : toks[i][0] === "A"
        ? toks[i][1]
        : JSON.stringify(toks[i][1]);
    const tail = !toks[++i] || toks[i][0] === "C" ? null : n(++j);
    code += `\n  const ${name}=(s,o)=>\to(s, '${mol}', ${head}, ${tail});`;
  }
  return new Function(`
return (_) => (__ = (...terms) => terms.join('')) => {${code}
  return ${toks[0][1]};
}`)()(args);
};
