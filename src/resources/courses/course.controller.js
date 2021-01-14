const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const { User } = require("../user/user.model");
const { Course, validateCourse } = require("./course.model");

async function create_course(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (payload.role !== "admin") return res.status(401).send({ message: "Forbidden" });

    const error = validateCourse(req.body);
    if (error) return res.status(400).send({ message: error });

    try {
        let course = await Course.findOne({ code: req.body.code });
        if (course) return res.status(400).send({ message: "Course with this code already exists" });

        course = new Course({
            name: req.body.name,
            code: req.body.code,
            credit_hours: req.body.credit_hours,
            imgURL: req.body.imgURL
        });

        await course.save();
        return res.send({ message: `Course '${course.name}' was created successfully` });

    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}

async function take_content(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (payload.role !== "teacher" && payload.role !== "admin") return res.status(401).send({ message: "Forbidden" });

    try {
        let request = await Course.findOne({ code: req.body.code });
        if (!request) return res.status(400).send({ message: "Course with this code doesn't exist" });

        //const content = {content: req.body.content}; 
        insert = await Course.findOneAndUpdate({ code: req.body.code }, { content: req.body.content }, { useFindAndModify: false });
        return res.send({ message: `Course '${req.body.code}' was updated successfully` });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}

async function get_users_in_course(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (!payload) return res.status(401).send("Forbidden");

    const course_id = req.params.courseID;
    try {
        let course = await Course.findById(course_id).populate("users").exec();
        if (!course) return res.status(404).send({ message: "Course not found" });
        res.send({
            course: course,
            message: "Success",
            students: course.users
        });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}


async function get_all_courses(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (!payload) return res.status(401).send("Forbidden");

    try {
        let courses = await Course.find({});
        res.send({
            courses: courses,
            message: "Success",
        });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}

async function assign_teachers(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (!payload || payload.role !== "admin") return res.status(401).send("Forbidden");

    try{
        const teachers_ids = req.body.teachers.map(s => Types.ObjectId(s));
        let users = await User.find({_id: {$in: teachers_ids}});
        let course = await Course.findOneAndUpdate({
            code: req.body.course_code
        },
        {
            $addToSet: {
                teachers: {
                    $each: users.map(u => u._id)
                }
            }
        }, {useFindAndModify: false});

        await User.updateMany({_id: {$in: teachers_ids}}, {$addToSet: {courses: course._id} }, {useFindAndModify: false});

        res.send({message: "added teachers successfully"});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}


async function enroll_students(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (!payload || payload.role !== "admin") return res.status(401).send("Forbidden");

    try{
        const students_ids = req.body.students.map(s => Types.ObjectId(s));
        let users = await User.find({_id: {$in: students_ids}});
        let course = await Course.findOneAndUpdate({
            code: req.body.course_code
        },
        {
            $addToSet: {
                users: {
                    $each: users.map(u => u._id)
                }
            }
        }, {useFindAndModify: false});

        await User.updateMany({_id: {$in: students_ids}}, {$addToSet: {courses: course._id} }, {useFindAndModify: false});

        res.send({message: "added students successfully"});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}



module.exports = { create_course, take_content, get_all_courses, get_users_in_course, assign_teachers, enroll_students }
