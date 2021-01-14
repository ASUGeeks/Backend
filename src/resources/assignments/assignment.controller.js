const {Course} = require("../courses/course.model");
const {Assignment, Submission} = require("./assignment.model");
const jwt = require("jsonwebtoken");
const { User } = require("../user/user.model");
const mongoose = require("mongoose");

const create_assignment = async function(req, res){

    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload || (payload.role !== "teacher" && payload.role !== "admin"))
        return res.status(401).send({message: "Forbidden"});

    if(!req.body.course_code) return res.status(404).send({message: "Please send the course id"});

    const ass = req.body.assignment;

    try {
        const course = await Course.findOne({code: req.body.course_code});
        if(!course) return res.status(404).send({message: `Course with code ${req.body.course_code} note found`})

        const assignment = new Assignment({
            course: course._id,
            title: ass.title,
            discreption: ass.discreption,
            deadline: ass.deadline,
            url: ass.url
        });

        await assignment.save();
        await Course.findOneAndUpdate({code: req.body.course_code}, {$push: {assignments: assignment._id}})
        res.send({message: "Assignment Created successfully"});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}

const submit_assignment = async function(req, res){

    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const assignment_id = req.params.assignment_id;
    if(!assignment_id) return res.status(404).send({message: "Please send assignment id"});

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload) return res.status(401).send({message: "Forbidden"});

    try{

        const submission = new Submission({
            _id: mongoose.Types.ObjectId(),
            url: req.body.url,
            user: payload.user_id,
            assignment: assignment_id
        })

        const assignment = await Assignment.findByIdAndUpdate(assignment_id, {$push: {submissions: submission._id}});

        await submission.save()

        await User.findByIdAndUpdate(payload.user_id, {
            $push: {submissions: submission._id}
        }, {new: true, useFindAndModify: false});

        res.send({message: "Success"});
    }catch(e){
        return res.status(500).send({message: e.message});
    }

}

async function get_assignments(req, res){
    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const courseID = req.params.courseID;
    if(!courseID) return res.status(404).send({message: "Please send course id in url"});

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload) return res.status(401).send({message: "Forbidden"});

    try{
        const course = await Course.findById(courseID).populate("assignments").exec();
        if(!course) return res.status(404).send({message: "Course not found"});

        res.send({message: "Success", assignments: course.assignments});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}


async function get_submissions(req, res){
    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const assID = req.params.assID;
    if(!assID) return res.status(404).send({message: "Please send course id in url"});

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload || (payload.role !== "admin" && payload.role !== "teacher"))
        return res.status(401).send({message: "Forbidden"});

    try{
        const assignment = await Assignment.findById(assID)
        .populate({path: "submissions", populate: ["user", "assignment"]}).exec();
        if(!assignment) return res.status(404).send({message: "Assignment not found"});

        res.send({message: "Success", submissions: assignment.submissions});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}



module.exports = { create_assignment, submit_assignment, get_assignments, get_submissions };