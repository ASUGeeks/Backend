const { Course } = require("../../src/resources/courses/course.model");
const { Assignment, Submission } = require("../../src/resources/assignments/assignment.model");
const { User } = require("../../src/resources/user/user.model");

const bcrypt = require("bcrypt");

const request = require("supertest");
require("dotenv").config();
var server;
var teacher_token;
var student_token;
var course_id;
var user_id;
var assignment_id;

describe("Assignment", () => {

    beforeAll(async done => {
        server = await require("../../app.js");
        done();
    })

    afterAll(async done => {
        server.close();
        done();
    })

    beforeEach(async done => {
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

        const assignment = new Assignment({
            course: course_id,
            descreption: "some assignment to make your life a bit worse",
            url: "https://drivelink.com",
            title: "Assignment 1",
            deadline: new Date()
        });

        await assignment.save();
        assignment_id = assignment._id;

        await Course.findByIdAndUpdate(course_id, { $push: { users: user_id, assignments: assignment_id } }, { new: true, useFindAndModify: false })
        await User.findByIdAndUpdate(user_id, { $push: { courses: course_id } }, { new: true, useFindAndModify: false })

        done();
    });

    afterEach(async done => {
        await Course.deleteMany({});
        await User.deleteMany({});
        await Assignment.deleteMany({});
        await Submission.deleteMany({});
        done();
    });

    describe("create-assignment", () => {
        it("should return 200 and save assignment to db", async () => {
            const res = await request(server).post("/create-assignment")
                .set("token", teacher_token)
                .send({
                    course_code: "CSE101",
                    assignment: {
                        descreption: "some assignment so you hate me even more",
                        url: "someurl.com",
                        deadline: new Date(),
                        title: "Assignment 1"
                    }
                });

            expect(res.body.message).toBe("Assignment Created successfully");
            expect(res.status).toBe(200);
        });
    });

    describe("submit-assignment/assignment-id", () => {
        it("should submit the assignment data and return the grad", async () => {
            let res = await request(server).post(`/submit-assignment/${assignment_id}`)
                .set("token", student_token)
                .send({
                    url: "https://ass-submission-url.com"
                });

            expect(res.body.message).toBe("Success");
            expect(res.status).toBe(200);

            const a = await Assignment.findById(assignment_id)
            .populate({path: "submissions", populate: "user"}).exec();
            expect(a.submissions).toHaveLength(1);
            expect(a.submissions[0].user.username).toBe("username2");

        });
    });

    describe("list all assignments", () => {
        it("should return 200 and a list of all assignments to a given course", async () => {
            let res = await request(server).get(`/assignments/${course_id}`).set("token", student_token);
            expect(res.body.message).toBe("Success");
            expect(res.body.assignments).toHaveLength(1);
            expect(res.body.assignments[0].title).toBe("Assignment 1");
        })
    })

    describe("list all submissions", () => {
        it("should return 200 and a list of all submissions to a given assignments", async () => {
            const submission = new Submission({
                user: user_id,
                assignment: assignment_id,
                url: "someurl.net",
            });
            await submission.save();
            await Assignment.findByIdAndUpdate(assignment_id, {$push: {submissions: submission._id}}, {new: true, useFindAndModify: false});

            let res = await request(server).get(`/submissions/${assignment_id}`).set("token", teacher_token);
            expect(res.body.message).toBe("Success");
            expect(res.body.submissions).toHaveLength(1);
            expect(res.body.submissions[0].grade).toBe(0);
            expect(res.body.submissions[0].graded).toBe(false);
            expect(res.body.submissions[0].user.username).toBe("username2");
            expect(res.body.submissions[0].assignment.title).toBe("Assignment 1");
        })

        it("should return 401 Forbidden", async () => {
            let res = await request(server).get(`/submissions/${assignment_id}`).set("token", student_token);
            expect(res.body.message).toBe("Forbidden");
            expect(res.status).toBe(401);
        })
    })
});

