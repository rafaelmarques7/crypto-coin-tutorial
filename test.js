const crypto = require("crypto")

const nonce = 1
const hashHex = crypto.createHash("sha256").update("raf" + nonce.toString()).digest('hex')
const hashBinary = parseInt(hashHex, 16).toString(2)


