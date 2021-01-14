const { create_quiz, submit_quiz } = require("./quiz.controller");

const quizRouter = app => {
    app.post("/create-quiz", [], create_quiz);
    app.post("/submit-quiz", [], submit_quiz);
};

module.exports = quizRouter;

