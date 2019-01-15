//@flow
const fs = require("fs")
const path = require("path")
const j = path.join
const cp = require("child_process")
const pkg /*: { version: string } */ = JSON.parse(
  fs.readFileSync(j(__dirname, "..", "package.json"), "utf8")
)
const mgs = fs.readFileSync(j(__dirname, "..", process.argv[2]), "utf8")
console.log(pkg)

fs.writeFileSync(j(__dirname, "..", process.argv[2]), "#utf8")
fs.unlink(j(__dirname, "..", "dist/main.js"))

const code = cp.execSync("yarn run build", {
  cwd: path.join(__dirname, ".."),
  encoding: "utf8"
})

if (fs.existsSync(j(__dirname, "..", "dist/main.js"))) {
  console.log(code)
} else {
  process.exit(-1)
}
