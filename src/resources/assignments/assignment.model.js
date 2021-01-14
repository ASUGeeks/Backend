const mongoose = require("mongoose");
require("dotenv").config();

const assignmentSchema = new mongoose.Schema({
    course: { type: mongoose.Types.ObjectId, required: true, ref: "Course" },
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    deadline: { type: Date, required: true },
    submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submission" }]
});

const Assignment = mongoose.model("Assignment", assignmentSchema);


const submissionSchema = new mongoose.Schema({
    assignment: {type: mongoose.Types.ObjectId, ref: "Assignment"},
    user: {type: mongoose.Types.ObjectId, ref: "User"},
    url: {type: String, required: true},
    grade: {type: Number, default: 0},
    graded: {type: Boolean, default: false}
})

const Submission = mongoose.model("Submission", submissionSchema)

module.exports = { Assignment, Submission };