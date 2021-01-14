const { Course } = require("../../src/resources/courses/course.model");
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

        done();
    });


    afterAll(async done => {
        await Course.deleteMany({});
        await User.deleteMany({});
        server.close();
        done();
    });

    describe("create-announcement", () => {
        it("should return 200 and save announcement to db", async () => {
            let res = await request(server).post("/create-announcement")
            .set("token", teacher_token)
            .send({
                course_code: "CSE101",
                announcement: {
                    title: "something is going to happen",
                    body: "hold on to you hats, little pieces of human trash. You need to submit a very large project in two days, and I will take no excuses"
                }
            });

            expect(res.body.message).toBe("Announcement Created successfully");
            expect(res.status).toBe(200);

            res = await request(server).get("/me").set("token", student_token).send();
            expect(res.body.message).toBe("Success");
            expect(res.status).toBe(200);
            expect(res.body.courses).toHaveLength(1);
            expect(res.body.courses[0].announcements).toHaveLength(1);
            expect(res.body.courses[0].announcements[0].title).toBe("something is going to happen")
        });
    });

});

