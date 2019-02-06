// @flow strict
import http from 'http'
const server = http.createServer((req, res) => {
  console.log(req.headers)
  console.log(req.url)
  res.statusCode = 201
  res.write('ok')
  res.end()
})
// const web = require('./src/web.js')
//
// function app(req, res) {
//   if (req.method === 'GET') {
//     res(200, { 'Content-Type': 'text/plain' }, 'Hello World\n')
//   } else {
//     res(404, {}, '')
//   }
// }
//
// var server = require('net').createServer(
//   require('./src/web').socketHandler(app)
// )
server.listen(8888, function() {
  var address = server.address()
  console.log(address)
  console.log('http://%s:%s/', address.address, address.port)
})
