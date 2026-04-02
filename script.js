//this script is used to generate admin_auth_secret
const crypto = require("crypto");
const sec = crypto.randomBytes(32).toString("hex")
console.log(sec)

