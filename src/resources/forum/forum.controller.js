const jwt = require("jsonwebtoken");
const { Course } = require("../courses/course.model");
const { Question, Comment } = require("./forum.model");

async function get_discussion(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (!payload) return res.status(401).send({ message: "Forbidden" });

    const course_id = req.params.courseID;
    try {
        let course = await Course.findById(course_id).populate({
            path: "questions",
            populate: [{
                path: "comments",
                populate: {
                    path: "author"
                }
            }, {
                path: "author"
            }]
        }).exec();

        if (!course) return res.status(404).send({ message: "Course not found" });
        res.send({
            message: "Success",
            questions: course.questions
        });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}

async function ask_question(req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (!payload) return res.status(401).send({ message: "Forbidden" });

    const course_code = req.body.course_code;
    if (!course_code) return res.status(404).send({ message: "Please send the course code" })

    try {
        const course = await Course.findOne({ code: course_code });
        if (!course) return res.status(404).send({ message: "Course not found" });

        const q = new Question({
            course: course._id,
            author: payload.user_id,
            body: req.body.question,
        });

        await q.save();
        await Course.findOneAndUpdate({ code: course_code }, { $push: { questions: q._id } }, { new: true, useFindAndModify: false });
        
        res.send({ message: "Success" });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }

}

async function answer_question (req, res){
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (!payload) return res.status(401).send({ message: "Forbidden" });

    const qid = req.body.question_id;
    if (!qid) return res.status(404).send({ message: "Please send the question id" })

    try {
        const question = await Question.findById(qid);
        if (!question) return res.status(404).send({ message: "Question not found" });

        const c = new Comment({
            question: qid,
            author: payload.user_id,
            body: req.body.comment,
        });

        await c.save();
        await Question.findByIdAndUpdate(qid, { $push: { comments: c._id } }, { new: true, useFindAndModify: false });
        
        res.send({ message: "Success" });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}

module.exports = { get_discussion, ask_question, answer_question }