const { create_course, take_content, get_users_in_course, get_all_courses, enroll_students, assign_teachers } = require("./course.controller");

const courseRouter = app => {
    app.get("/courses", [], get_all_courses);
    app.post('/create-course', [], create_course);
    app.post('/update-course', [], take_content);
    app.get('/users/:courseID', [], get_users_in_course);
    app.post("/users/enroll-students", [], enroll_students);
    app.post("/users/assign-teachers", [], assign_teachers);
};

module.exports = courseRouter;
