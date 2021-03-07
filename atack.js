const atack = [];
const A = (...args) => atack.push(args);
const S = () => atack.pop();
module.exports = { atack, A, S };
