const { create_quiz, submit_quiz } = require("./quiz.controller");

const quizRouter = app => {
    app.post("/create-quiz", [], create_quiz);
    app.post("/submit-quiz/:quiz_id", [], submit_quiz);
};

module.exports = quizRouter;

