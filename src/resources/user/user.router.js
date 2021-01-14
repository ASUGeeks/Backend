const { login, createAccount, getCourses, getUsers } = require("./user.controller");

const userRouters = app => {
  app.get("/me", [], getCourses)
  app.post('/login', [], login);
  app.post('/create-account', [], createAccount);
  app.get('/list-users', [], getUsers)
};

module.exports = userRouters;
