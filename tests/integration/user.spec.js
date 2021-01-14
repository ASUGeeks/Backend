const { User } = require("../../src/resources/user/user.model");
const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Course } = require("../../src/resources/courses/course.model");
var server;
var token;
var course_id;
var user_data = {
    _id: mongoose.Types.ObjectId(),
    username: "username",
    email: "email@exmaple.com",
    role: "teacher",
    password: "somepassword"
}
require("dotenv").config();

describe("test user authentication", () => {

    beforeAll(async done => {
        server = await require("../../app.js");
        done();
    })

    afterAll(done => {
        server.close();
        done();
    });

    describe("/login", () => {
        beforeEach(async (done) => {
            const hash = await bcrypt.hash("mypassword", 10);
            const user = new User({ username: "username", password: hash, email: "user@example.com" });
            await user.save();
            done();
        });

        afterEach(async (done) => {
            await User.deleteMany({});
            done();
        });

        it("should return status code 200 with token in place", async (done) => {
            const res = await request(server)
                .post("/login")
                .send({ username: "username", password: "mypassword" });
            expect(res.status).toBe(200);

            const data = JSON.parse(res.text);
            expect(data.token).toBeTruthy();

            const payload = jwt.verify(data.token, process.env.APP_KEY);
            expect(payload.user_id).toBeTruthy()
            expect(payload.username).toBe("username");
            expect(payload.email).toBe("user@example.com");
            expect(payload.role).toBe("student");
            done();
        });

        it("should return status code 400 with Wrong username or password error", async (done) => {
            const res = await request(server)
                .post("/login")
                .send({ username: "not my username", password: "mypassword" });
            expect(res.status).toBe(400);
            expect(res.text).toBe("Wrong username or password");
            done();
        });

        it("should return status code 400 with Wrong username or password error", async (done) => {
            const res = await request(server)
                .post("/login")
                .send({ username: "username", password: "not my password" });
            expect(res.status).toBe(400);
            expect(res.text).toBe("Wrong username or password")
            done();
        });

        it("should return status code 400 with required data", async (done) => {
            var res = await request(server).post("/login").send({ password: "password" });
            expect(res.status).toBe(400);
            res = await request(server).post("/login").send({ username: "username" });
            expect(res.status).toBe(400);
            done();
        });
    });

    describe("/create-account", () => {
        beforeAll(async done => {
            const hash = await bcrypt.hash("adminadmin", 10);
            const user = new User({
                username: "adminadmin",
                password: hash,
                email: "admin@example.com",
                role: "admin"
            });
            await user.save();
            token = await user.generateAuthToken();
            done();
        });


        afterAll(async (done) => {
            await User.deleteMany({});
            done();
        });

        it("should create an account in the database with the given role and return 200 status", async (done) => {

            let res = await request(server).post("/create-account")
                .set("token", token)
                .send({
                    username: user_data.username,
                    email: user_data.email,
                    role: user_data.role,
                    password: user_data.password
                });
            expect(res.body.message).toBe("user 'username' was created successfully");
            expect(res.status).toBe(200);
            done();
        });
    });

    describe("/list-users", () => {
        beforeAll(async done => {
            const hash = await bcrypt.hash("adminadmin", 10);
            const user = new User({
                username: "adminadmin",
                password: hash,
                email: "admin@example.com",
                role: "admin"
            });

            await user.save();
            token = await user.generateAuthToken();

            const student = new User({
                username: "studentstudent",
                password: hash,
                email: "student@example.com",
                role: "student"
            });
            const teacher = new User({
                username: "teacherteacher",
                password: hash,
                email: "teacher@example.com",
                role: "teacher"
            });

            await student.save();
            await teacher.save();
            done();
        });


        afterAll(async (done) => {
            await User.deleteMany({});
            done();
        });

        it("should return list of students and teachers", async (done) => {
            let res = await request(server).get("/list-users")
                .set("token", token)
                .send();
            expect(res.body.message).toBe("Success");
            expect(res.status).toBe(200);
            expect(res.body.students).toHaveLength(1);
            expect(res.body.teachers).toHaveLength(1);
            done();
        });
    });

    describe("/get-users/course-id", () => {

        beforeAll(async done => {
            const hash = await bcrypt.hash("useruser", 10);
            const user = new User(user_data);
            await user.save();
            token = await user.generateAuthToken();
            course_id = mongoose.Types.ObjectId();
            let course = new Course({
                _id: course_id,
                code: "CSE101",
                name: "Structural Programing",
                credit_hours: 4,
                users: [user._id]
            })
            course = await course.save();
            done();
        });


        afterAll(async (done) => {
            await User.deleteMany({});
            await Course.deleteMany({});
            done();
        });

        it("should get all users that are registered in this course", async () => {
            let res = await request(server).get(`/users/${course_id}`).set({ token });
            expect(res.body.message).toBe("Success");
            expect(res.status).toBe(200);
            expect(res.body.students[0]._id).toBe(user_data._id.toHexString());
        });
    });
});
