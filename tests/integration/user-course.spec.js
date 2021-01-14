const { Course } = require("../../src/resources/courses/course.model");
const { User } = require("../../src/resources/user/user.model");
const request = require("supertest");
const bcrypt = require("bcrypt");
const { ExpectationFailed } = require("http-errors");
require("dotenv").config();
var server;
var admin_token;
var teacher_token;
var student_token;
var course_id;
var admin_id;
var teacher_id;
var student_id;

describe("test user relations with courses", () => {

    beforeAll(async done => {
        server = await require("../../app.js");
        const hash = await bcrypt.hash("mypassword", 10);

        let user = new User({
            username: "adminuser",
            email: "admin.example.com",
            role: "admin",
            password: hash
        });
        await user.save();
        admin_id = user._id;
        admin_token = user.generateAuthToken();

        user = new User({
            username: "teacheruser",
            email: "teacher.example.com",
            role: "teacher",
            password: hash
        });
        await user.save();
        teacher_id = user._id;
        teacher_token = user.generateAuthToken();

        user = new User({
            username: "studentuser",
            email: "student.example.com",
            role: "student",
            password: hash
        });
        await user.save();
        student_id = user._id;
        student_token = user.generateAuthToken();



        let course = new Course({
            name: "Course1",
            code: "CSE101",
            credit_hours: 3,
        });
        await course.save();
        course_id = course._id;

        // await Course.findByIdAndUpdate(course_id, { $addToSet: { users: student } }, { new: true, useFindAndModify: false })
        // await User.findByIdAndUpdate(student_id, { $addToSet: { courses: course_id } }, { new: true, useFindAndModify: false })

        course = new Course({
            name: "Course2",
            code: "CSE102",
            credit_hours: 3,
        });
        await course.save();
        done();
    });


    afterAll(async done => {
        await Course.deleteMany({});
        await User.deleteMany({});
        server.close();
        done();
    });

    describe("assign teachers", () => {
        it("should assign a list of teachers to the course", async () => {
            const res = await request(server).post("/users/assign-teachers")
            .set("token", admin_token)
            .send({
                course_code: "CSE101",
                teachers: [teacher_id.toHexString()]
            });

            expect(res.body.message).toBe("added teachers successfully")
            expect(res.status).toBe(200);
            
            let c = await Course.findOne({code: "CSE101"}).populate("teachers").exec();
            expect(c.teachers).toHaveLength(1);
            expect(c.teachers[0].username).toBe("teacheruser");

            let t = await User.findById(teacher_id).populate("courses").exec();
            expect(t.courses).toHaveLength(1);
            expect(t.courses[0].code).toBe("CSE101")
        })
    })


    describe("enroll students", () => {
        it("should enroll a list of students to the course", async () => {
            const res = await request(server).post("/users/enroll-students")
            .set("token", admin_token)
            .send({
                course_code: "CSE101",
                students: [student_id.toHexString()]
            });

            expect(res.body.message).toBe("added students successfully")
            expect(res.status).toBe(200);
            
            let c = await Course.findOne({code: "CSE101"}).populate("users").exec();
            expect(c.users).toHaveLength(1);
            expect(c.users[0].username).toBe("studentuser");

            let t = await User.findById(student_id).populate("courses").exec();
            expect(t.courses).toHaveLength(1);
            expect(t.courses[0].code).toBe("CSE101")
        })
    })

});