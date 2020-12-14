module.exports = function rna(toks, s = true) {
  let n;
  let i;
  let code = `return ${toks[0][1]};`;
  for (let index = 0; index < toks.length; index++) {
    let [m, v] = toks[index];
    if ("C" === m) {
      n = v;
      i = -1;
    } else {
      const name = n + (i++ > -1 ? i : " ");
      const h = ("A" === m
        ? v
        : "G" === m
        ? v
          ? "_." + v.name
          : "__"
        : JSON.stringify(v)
      ).padEnd(13, " ");
      const t =
        index + 1 === toks.length || toks[index + 1][0] === "C"
          ? "null"
          : n + (i + 1);
      if (s) code += `\nfunction ${name}(s,o){o(s, "${m}", ${h},${t})}`;
      else code += `\nfunction ${name}(o){o("${m}", ${h},${t})}`;
    }
  }
  const reducers = toks.reduce((s, [m, f]) => {
    if (m !== "G" || !f) return s;
    if (typeof f !== "function" || !f.name.length)
      throw new Error("args must be named functions!");
    s[f.name] = f;
    return s;
  }, {});
  return new Function(
    `return (_) => (__ = (...terms) => terms.join(''))=> {\n${code}\n}`
  )()(reducers);
};
