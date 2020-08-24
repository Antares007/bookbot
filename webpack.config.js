const path = require("path");

module.exports = {
  entry: "./src/counter7.js",
  output: {
    filename: "counter7.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [{ test: /\.js$/, use: "babel-loader" }],
  },
};
