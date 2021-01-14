const { create_announcement } = require("./announcement.controller");

const annRouter = app => {
    app.post("/create-announcement", [], create_announcement);
};

module.exports = annRouter;

