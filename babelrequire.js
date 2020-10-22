require("/usr/lib/node_modules/@babel/register");
for (let m of process.argv.slice(2)) require("./" + m);
