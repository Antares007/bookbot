"use strict";

var _https = _interopRequireDefault(require("https"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const querystring = require('querystring');

var a = {
  recipient: {
    id: '376858172875329'
  },
  timestamp: 1548870035697,
  sender: {
    id: '2081128551910714'
  },
  postback: {
    payload: '<postback_payload>',
    title: 'Get Started'
  }
};

function persistent_menu() {
  return () => {};
}

let see12 = persistent_menu();
if (!process.env.PAGE_ACCESS_TOKEN) throw new Error('PAGE_ACCESS_TOKEN not set');
const url = 'https://graph.facebook.com/v2.6/me/messages?access_token=' + process.env.PAGE_ACCESS_TOKEN;
const psid = postJson(url, {
  recipient: {
    id: '20811285519107144'
  },
  sender_action: 'typing_off'
});

function postJson(url, message) {
  const data = JSON.stringify(message);
  if (!data) throw new Error('cant stringify message');
  const {
    hostname,
    pathname,
    search
  } = new URL(url);
  const options = {
    hostname,
    path: pathname + search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = _https.default.request(options, res => {
    console.log(res.headers);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', d => {
      data += d;
    });
    res.on('end', () => console.log(JSON.parse(data)));
    res.on('error', console.log.bind(console));
  });

  req.once('error', console.log.bind(console));
  req.write(data);
  req.end();
}