const { required } = require("@hapi/joi");

module.exports = async function (req, res, next){
    req.header("Access-Control-Allow-Origin", "*");
    req.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    req.header("Access-Control-Allow-Headers", "token, Content-Type");
    req.header("Access-Control-Expose-Headers", "token, Content-Type");
    next();
}