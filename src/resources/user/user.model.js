const mongoose = require("mongoose");
const joi = require("@hapi/joi");

const jwt = require("jsonwebtoken");
require("dotenv").config();


const userSchema = new mongoose.Schema({
    username: { type: String, minlength: 3, maxlength: 255, required: true },
    password: { type: String, minlength: 5, maxlength: 1023, required: true },
    role: { type: String, default: "student" },
    email: { type: String, minlength: 5, maxlength: 1023, required: true },
    courses: [{ type: mongoose.Types.ObjectId, ref: "Course" }],
    taken_quizes: [{ type: mongoose.Schema.Types.Mixed, ref: "Quiz", grade: { type: [Number], default: [0, 1] } }],
    submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submission" }]
});

userSchema.methods.generateAuthToken = function () {
    /**
     * payload:
     *  'user_id': user.pk,
     *  'username': user.username,
     *  'email': user.username,
     *  'name': name,
     *  'state': state,
     *  'valid_password': user.valid_password,
     *  'department': department,
     *  'type': user.account_type
     */

    // Can't find all the other values in the schema
    const token = jwt.sign({
        user_id: this._id,
        username: this.username,
        email: this.email,
        role: this.role
    }, process.env.APP_KEY)
    return token
};

const User = mongoose.model('User', userSchema);

function validateUser(data) {
    /**
     * schema:
     *  username
     *  password
     */
    const Schema = joi.object({
        username: joi.string().min(5).max(255).required(),
        password: joi.string().min(8).max(1023).required(),
    });
    // const result = joi.validate(data, Schema)
    const result = Schema.validate(data);
    if (result.error) return result.error.details[0].message;
    else return false;
};

function validateUserData(data) {
    const Schema = joi.object({
        username: joi.string().min(5).max(255).required(),
        password: joi.string().min(8).max(1023).required(),
        email: joi.string().min(8).max(1023).required(),
        role: joi.string().valid("student", "teacher", "admin").default("student")
    });
    // const result = joi.validate(data, Schema)
    const result = Schema.validate(data);
    if (result.error) return result.error.details[0].message;
    else return false;
}

exports.User = User;
exports.validateUser = validateUser;
exports.validateUserData = validateUserData;
