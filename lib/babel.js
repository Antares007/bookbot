module.exports = {
  parse(code) {
    return require("@babel/parser").parse(code, {
      sourceType: "module",
      plugins: ["flow"],
    });
  },
};
