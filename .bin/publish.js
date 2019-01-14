//@flow
const fs = require("fs")
const path = require("path")
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
)
console.log(
  fs.readFileSync(path.join(__dirname, "..", process.argv[2]), "utf8")
)
console.log(pkg)
