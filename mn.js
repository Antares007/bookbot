module.exports = function mn(t, ...args) {
  const ws = " \n\r\t";
  const toks = [];
  var spos = 0,
    tpos = 0,
    apos = 0;
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
        else toks.push(["T", term === "ε" ? "" : term]);
      }
    } else {
      tpos++;
      spos = 0;
      if (apos < args.length) toks.push(["G", args[apos++]]);
      else toks[toks.length - 1][0] !== "G" && toks.push(["G"]);
    }
  }
  return toks;
};
