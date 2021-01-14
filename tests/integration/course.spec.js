const { Course } = require("../../src/resources/courses/course.model");
const { User } = require("../../src/resources/user/user.model");
const request = require("supertest");
const bcrypt = require("bcrypt");
require("dotenv").config();
var server;
var token;
var course_id;
var user_id;

describe("test user authentication", () => {

    beforeAll(async done => {
        server = await require("../../app.js");
        const hash = await bcrypt.hash("mypassword", 10);
        const user = new User({
            username: "adminuser",
            email: "admin.example.com",
            role: "admin",
            password: hash
        });
        await user.save();
        user_id = user._id;
        token = user.generateAuthToken();

        let course = new Course({
            name: "Course1",
            code: "CSE101",
            credit_hours: 3,
        });
        await course.save();
        course_id = course._id;

        await Course.findByIdAndUpdate(course_id, { $push: { users: user_id } }, { new: true, useFindAndModify: false })
        await User.findByIdAndUpdate(user_id, { $push: { courses: course_id } }, { new: true, useFindAndModify: false })

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

    describe("/create-course", () => {
        it("should return 200 and should create course in database", (done) => {

            request(server).post("/create-course")
                .set("token", token)
                .send({
                    name: "Course one",
                    code: "CSE156",
                    TAs: ["Ahmed my heart"],
                    credit_hours: 3,
                }).then(res => {
                    expect(res.body.message).toBe("Course 'Course one' was created successfully");
                    expect(res.status).toBe(200);
                    done();
                }).catch(e => {
                    console.log(e);
                })
        });
    });

    describe("/update-course", () => {

        it("should add the content of the course to the database", async () => {
            const content = [
                {
                    title: "week1",
                    type: "vid",
                    data: [
                        {
                            title: "lecture1",
                            url: "ommxadlfkjadf"
                        }
                    ]
                }
            ];
            let res = await request(server).post("/update-course")
                .set("token", token)
                .send({
                    code: "CSE101",
                    content: content
                })
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Course 'CSE101' was updated successfully")
            let course = await Course.findOne({ code: "CSE101" }).lean();
            expect(course.content).toStrictEqual(content);
        })
    });

    describe("/me", () => {
        it("should return a list of courses assigned to this user and status 200", async () => {
            const res = await request(server).get("/me").set("token", token);
            expect(res.body.message).toBe("Success");
            expect(res.status).toBe(200);
            expect(res.body.courses).toHaveLength(1);
            expect(res.body.courses[0]._id).toBe(course_id.toHexString());
        })
    })
});