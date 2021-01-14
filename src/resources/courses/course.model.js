const mongoose = require("mongoose");
const joi = require("@hapi/joi");


const CourseSchema = new mongoose.Schema({
    name: { type: String, minlength: 5, maxlength: 1023, required: true },
    code: { type: String, minlength: 1, maxlength: 255, required: true, unique: true },
    teachers: [{type: mongoose.Types.ObjectId, ref: "User"}],
    TAs: { type: [String] },
    credit_hours: { type: Number, min: 0, max: 10 },
    imgURL: { type: String, default: "https://i.imgflip.com/2xlcka.png" },
    content: { type: [Object], default: [] },
    users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    quizes: [{ type: mongoose.Types.ObjectId, ref: "Quiz" }],
    assignments: [{ type: mongoose.Types.ObjectId, ref: "Assignment" }],
    announcements: [{ type: mongoose.Types.ObjectId, ref: "Announcement" }],
    questions: [{ type: mongoose.Types.ObjectId, ref: "Question" }]
});

const Course = mongoose.model("Course", CourseSchema);


function validateCourse(data) {
    /**
     * schema:
     *  username
     *  password
     */
    const Schema = joi.object({
        name: joi.string().min(5).max(255).required(),
        code: joi.string().min(1).max(255).required(),
        credit_hours: joi.number().min(0).max(10)
    }).unknown();
    // const result = joi.validate(data, Schema)
    const result = Schema.validate(data);
    if (result.error) return result.error.details[0].message;
    else return false;
};


module.exports.Course = Course;
module.exports.validateCourse = validateCourse;
