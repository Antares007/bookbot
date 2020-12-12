module.exports = function programmer(t, ...args) {
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
      if (apos < args.length) toks.push(["G", args[apos++].name]);
      else toks[toks.length - 1][0] !== "G" && toks.push(["G"]);
    }
  }
  toks.reverse();
  const n = (i) => "λ" + i.toString(16);
  var i = 0;
  let code = "";
  let hastail = false;
  for (let tok of [...toks]) {
    if (tok[0] === "C") {
      code += `\nconst ${tok[1]}=${n(i)}`;
      hastail = false;
    } else {
      const m = tok[0];
      const name =
        m === "A"
          ? tok[1]
          : m === "T"
          ? JSON.stringify(tok[1])
          : `_.${tok.length === 1 ? "_" : tok[1]}`;
      const tail = hastail ? n(i) : "null";
      code += `\nconst ${n(i + 1)}\t=(s,o)=>o(s,\t${name},\t${tail},\t'${m}')`;
      hastail = true;
      i++;
    }
  }
  code += "\nreturn " + n(i);
  return new Function(`
return (_) => (__ = (...terms) => terms.join('')) => {\n_._ = __;\n${code}\n}`)()(
    args.reduce((m, f) => {
      if (typeof f !== "function" || !f.name.length)
        throw new Error("args must be named functions!");
      m[f.name] = f;
      return m;
    }, {})
  );
};
