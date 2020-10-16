module.exports = {
  parse(code) {
    return require("/usr/lib/node_modules/@babel/parser").parse(code, {
      sourceType: "module",
      plugins: ["flow"],
    });
  },
};
