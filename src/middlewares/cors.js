const { required } = require("@hapi/joi");

module.exports = async function (req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "token, Content-Type");
    res.header("Access-Control-Expose-Headers", "token, Content-Type");
    next();
}