const mn = require("./mn");
const rna = require("./rna");
module.exports = function programmer(t, ...args) {
  return (d) => rna(mn(t, ...args))(d);
};
