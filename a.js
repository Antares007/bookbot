const { A, S } = require("./atack");
const f = () => A(S()[0] * 2);
A(2), f();
console.log(S());
