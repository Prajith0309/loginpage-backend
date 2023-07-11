const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('base64');
const Email = "katrina90@ethereal.email";
const PASSWORD = "twdnvfwy3EWvMpH76e";
module.exports = {
    secretKey,
    Email,
    PASSWORD
}