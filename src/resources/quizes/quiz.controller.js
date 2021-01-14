const {Course} = require("../courses/course.model");
const {Quiz} = require("./quiz.model");
const jwt = require("jsonwebtoken");
const { User } = require("../user/user.model");

const create_quiz = async function(req, res){

    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload || (payload.role !== "teacher" && payload.role !== "admin"))
        return res.status(401).send({message: "Forbidden"});

    if(!req.body.course_code) return res.status(404).send({message: "Please send the course id"});

    const content_answers = req.body.quiz;
    let content = [];
    let answers = [];
    for(q of content_answers){
        content.push({
            hash: q.hash,
            question: q.question,
            valid_answers: q.valid_answers
        });
        answers.push({
            hash: q.hash,
            answer: q.valid_answers[q.answer]
        })
    }

    try {
        const course = await Course.findOne({code: req.body.course_code});
        if(!course) return res.status(404).send({message: `Course with code ${req.body.course_code} note found`})
        const quiz = new Quiz({
            course: course._id,
            content: content,
            correct_answers: answers,
            start_date: req.body.start_date,
            title: req.body.title
        });

        await quiz.save();

        await Course.findOneAndUpdate({code: req.body.course_code}, {$addToSet: {quizes: quiz._id}}, {useFindAndModify: false})
        res.send({message: "Quiz Created successfully"});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}

const submit_quiz = async function(req, res){

    const token = req.headers.token;
    if (!token) return res.status(401).send("Forbidden");

    const quiz_id = req.body.quiz_id;
    if(!quiz_id) return res.status(404).send({message: "Please send quiz id"});

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload) return res.status(401).send({message: "Forbidden"});

    var answers = [];
    for(answer of req.body.answers){
        answers.push({
            hash: answer.hash,
            answer: answer.valid_answers[answer.answer]
        })
    }

    try{
        const quiz = await Quiz.findById(quiz_id);
        const grade = quiz.grade(answers);
        await User.findByIdAndUpdate(payload.user_id, {
            $addToSet: {taken_quizes: {_id: quiz._id, grade: grade}}
        }, {new: true, useFindAndModify: false});

        await Quiz.findByIdAndUpdate(quiz._id, {
            $addToSet: {users_taken: {_id: payload.user_id, grade: grade}}
        }, {new: true, useFindAndModify: false});


        res.send({message: "Success", grade: grade});
    }catch(e){
        return res.status(500).send({message: e.message});
    }

}

module.exports = { create_quiz, submit_quiz };