const mongoose = require("mongoose");
require("dotenv").config();

const quizSchema = new mongoose.Schema({
    course: { type: mongoose.Types.ObjectId, required: true, ref: "Course" },
    content: { type: [Object], maxlength: 15, minlength: 1, required: true },
    correct_answers: { type: [Object], maxlength: 15, minlength: 1, required: true },
    users_taken: [{type: mongoose.Types.ObjectId, ref: "User"}]
});


quizSchema.methods.grade = function(answers){
    let correct;
    let grade = 0;
    for(answer of answers){
        correct = this.correct_answers.find(item => item.hash === answer.hash).answer;
        if(correct === answer) grade += 1;
    }
    return [grade, this.content.length];
}

/**
 * Content: [
 *  {
 *      hash: "dfad",
 *      question: "what is your name",
 *      valid_answers: ["mahmoud", "hammad", "hisham", "omda", "naoum", "8andoor"]
 *  },
 * ]
 *
 *
 * CorrectAnswers: [
 *  {hash: "dfad", answer: "mahmoud"}
 * ]
 */

const Quiz = mongoose.model("Quiz", quizSchema);


exports.Quiz = Quiz;