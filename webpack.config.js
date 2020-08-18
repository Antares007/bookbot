const path = require("path");

module.exports = {
  entry: "./src/counter6.js",
  output: {
    filename: "counter6.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [{ test: /\.js$/, use: "babel-loader" }],
  },
};
