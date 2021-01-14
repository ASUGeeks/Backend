const mongoose = require("mongoose");


const questionSchema = mongoose.Schema({
    course: { type: mongoose.Types.ObjectId, ref: "Course" },
    body: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }]
})

const Question = mongoose.model("Question", questionSchema);

const commentSchema = mongoose.Schema({
    question: { type: mongoose.Types.ObjectId, ref: "Quesiton" },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    body: { type: String, required: true },
})

const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Question, Comment };
