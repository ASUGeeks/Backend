const {Course} = require("../courses/course.model");
const { Announcement } = require("./announcement.model");
const jwt = require("jsonwebtoken");

const create_announcement = async function(req, res){

    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload || (payload.role !== "teacher" && payload.role !== "admin"))
        return res.status(401).send({message: "Forbidden"});

    if(!req.body.course_code) return res.status(404).send({message: "Please send the course id"});

    try {
        const course = await Course.findOne({code: req.body.course_code});
        if(!course) return res.status(404).send({message: `Course with code ${req.body.course_code} note found`})
        const ann = new Announcement({
            course: course._id,
            title: req.body.announcement.title,
            body: req.body.announcement.body
        });

        await ann.save();

        await Course.findByIdAndUpdate(course._id, {$push: {announcements: ann._id}}, { new: true, useFindAndModify: false })
        res.send({message: "Announcement Created successfully"});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}

module.exports = { create_announcement }