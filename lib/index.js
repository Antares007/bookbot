"use strict";

function handleResponse(response) {
  if (response.success) {
    var value = response.value; // Works!
  } else {
    var error = response.error; // Works!
  }
}

var a = function a(o) {
  return function (i) {
    o(i + 1 + "");
    return true;
  };
};

a(function (v) {
  return console.log(v);
})(1);

var see = function see(o) {
  return function (i) {};
};