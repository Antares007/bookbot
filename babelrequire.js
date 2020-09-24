require("@babel/register");
for (let m of process.argv.slice(2)) require("./" + m);
