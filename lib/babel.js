module.exports = (code) =>
  require("@babel/parser").parse(code, {
    sourceType: "module",
    plugins: ["flow"],
  });
