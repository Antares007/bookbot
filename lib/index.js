"use strict";

function handleResponse(response) {
  if (response.success) {
    var value = response.value; // Works!
  } else {
    var error = response.error; // Works!
  }
}

let a = o => i => {
  o(i + 1 + '');
  return true;
};

a(v => console.log(v))(1);

const see = o => i => {};