const { create_assignment, submit_assignment, get_assignments, get_submissions } = require("./assignment.controller");

const assignmentRouter = app => {
    app.post("/create-assignment", [], create_assignment);
    app.post("/submit-assignment/:assignment_id", [], submit_assignment);
    app.get("/assignments/:courseID", [], get_assignments);
    app.get("/submissions/:assID", [], get_submissions);
};

module.exports = assignmentRouter;

