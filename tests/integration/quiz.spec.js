const { Course } = require("../../src/resources/courses/course.model");
const { Quiz } = require("../../src/resources/quizes/quiz.model");
const { User } = require("../../src/resources/user/user.model");

const bcrypt = require("bcrypt");

const request = require("supertest");
require("dotenv").config();
var server;
var teacher_token;
var student_token;
var course_id;
var user_id;

describe("Quiz", () => {

    beforeAll(async done => {
        server = await require("../../app.js");
        const hash = await bcrypt.hash("mypassword", 10);
        let user = new User({
            username: "username1",
            email: "user1@example.com",
            role: "teacher",
            password: hash
        });
        teacher_token = user.generateAuthToken();
        await user.save();


        user = new User({
            username: "username2",
            email: "user2@example.com",
            role: "student",
            password: hash
        });
        student_token = user.generateAuthToken();
        await user.save();

        user_id = user._id;

        let course = new Course({
            name: "Course1",
            code: "CSE101",
            credit_hours: 3,
        });

        await course.save();
        course_id = course._id;

        await Course.findByIdAndUpdate(course_id, { $push: { users: user_id } }, { new: true, useFindAndModify: false })
        await User.findByIdAndUpdate(user_id, { $push: { courses: course_id } }, { new: true, useFindAndModify: false })

        const quiz = new Quiz({
            course: course_id,
            content: [
                { hash: "adlfkjad", question: "1", valid_answers: ["1", "2", "3", "4"] },
                { hash: "adlfkj", question: "2", valid_answers: ["1", "2", "3", "4"] },
                { hash: "adlfad", question: "3", valid_answers: ["1", "2", "3", "4"] },
                { hash: "adffkjad", question: "4", valid_answers: ["1", "2", "3", "4"] },
                { hash: "adlfkad", question: "5", valid_answers: ["1", "2", "3", "4"] }
            ],
            correct_answers: [
                { hash: "adlfkjad", answer: "1" },
                { hash: "adlfkj", answer: "2" },
                { hash: "adlfad", answer: "3" },
                { hash: "adffkjad", answer: "4" },
                { hash: "adlfkad", answer: "5" }
            ],
            title: "Quiz 1",
            start_date: new Date()
        });

        await quiz.save();
        quiz_id = quiz._id;
        done();
    });

    afterAll(async done => {
        await Course.deleteMany({});
        await User.deleteMany({});
        server.close();
        done();
    });

    describe("create-quiz", () => {
        it("should return 200 and save quiz to db", async () => {
            const res = await request(server).post("/create-quiz")
                .set("token", teacher_token)
                .send({
                    course_code: "CSE101",
                    quiz: [
                        { hash: "adlfkjad", question: "1", valid_answers: ["1", "2", "3", "4"], answer: 0 },
                        { hash: "adlfkj", question: "2", valid_answers: ["1", "2", "3", "4"], answer: 1 },
                        { hash: "adlfad", question: "3", valid_answers: ["1", "2", "3", "4"], answer: 2 },
                        { hash: "adffkjad", question: "4", valid_answers: ["1", "2", "3", "4"], answer: 3 },
                        { hash: "adlfkad", question: "5", valid_answers: ["1", "2", "3", "4"], answer: 4 }
                    ],
                    start_date: new Date(),
                    title: "Quiz 1"
                });

            expect(res.body.message).toBe("Quiz Created successfully");
            expect(res.status).toBe(200);
        });
    });

    describe("submit-quiz/quiz-id", () => {
        it("should submit the quiz data and return the grad", async () => {
            let res = await request(server).post(`/submit-quiz/${quiz_id}`)
                .set("token", student_token)
                .send({
                    answers: [
                        { hash: "adlfkjad", question: "1", valid_answers: ["1", "2", "3", "4"], answer: 0 },
                        { hash: "adlfkj", question: "2", valid_answers: ["1", "2", "3", "4"], answer: 1 },
                        { hash: "adlfad", question: "3", valid_answers: ["1", "2", "3", "4"], answer: 2 },
                        { hash: "adffkjad", question: "4", valid_answers: ["1", "2", "3", "4"], answer: 0 },
                        { hash: "adlfkad", question: "5", valid_answers: ["1", "2", "3", "4"], answer: 2 }
                    ]
                });

            expect(res.body.message).toBe("Success");
            expect(res.status).toBe(200);
            expect(res.body.grade[0]).toBe(3);
            expect(res.body.grade[1]).toBe(5);

            const q = await Quiz.findById(quiz_id).populate("users_taken._id").exec();
            expect(q.users_taken).toHaveLength(1);
            expect(q.users_taken[0].grade).toHaveLength(2);
            expect(q.users_taken[0].grade[0]).toBe(3)
            expect(q.users_taken[0].grade[1]).toBe(5)

        });
    });
});

