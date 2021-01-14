const { create_assignment, submit_assignment, get_assignments, get_submissions, grade_submission } = require("./assignment.controller");

const assignmentRouter = app => {
    app.post("/create-assignment", [], create_assignment);
    app.post("/submit-assignment/:assignment_id", [], submit_assignment);
    app.get("/assignments/:courseID", [], get_assignments);
    app.get("/submissions/:assID", [], get_submissions);
    app.post("/grade-submission", [], grade_submission)
};

module.exports = assignmentRouter;

