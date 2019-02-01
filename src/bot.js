//@flow strict
import https from "https"

const querystring = require("querystring")
var a = {
  recipient: {
    id: "376858172875329"
  },
  timestamp: 1548870035697,
  sender: {
    id: "2081128551910714"
  },
  postback: {
    payload: "<postback_payload>",
    title: "Get Started"
  }
}

type SendApiResponse =
  | {
      recipient_id: string,
      message_id?: string
    }
  | {
      error: {
        message: string,
        type: string,
        code: number,
        error_subcode?: number,
        fbtrace_id: number
      }
    }

if (!process.env.PAGE_ACCESS_TOKEN) throw new Error("PAGE_ACCESS_TOKEN not set")

const url =
  "https://graph.facebook.com/v2.6/me/messages?access_token=" +
  process.env.PAGE_ACCESS_TOKEN

const psid = postJson(url, {
  recipient: { id: "2081128551910714" },
  sender_action: "typing_off"
}).then(rez => console.log(rez))

function postJson<A>(url: string, message: A): Promise<SendApiResponse> {
  const data = JSON.stringify(message)
  const { hostname, pathname, search } = new URL(url)
  const options = {
    hostname,
    path: pathname + search,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      res.setEncoding("utf8")
      let data = ""
      res.on("data", d => {
        data += d
      })
      res.on("end", () => resolve(JSON.parse(data)))
      res.on("error", reject)
    })
    req.on("error", reject)
    req.write(data)
    req.end()
  })
}
