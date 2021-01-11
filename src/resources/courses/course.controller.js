const jwt = require("jsonwebtoken");
const { Course, validateCourse } = require("./course.model");

async function create_course(req, res) {
    const token = req.headers.token;
    if(!token) return res.status(401).send({message: "Forbidden"});

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(payload.role !== "admin") return res.status(401).send({message: "Forbidden"});

    const error = validateCourse(req.body);
    if(error) return res.status(400).send({message: error});
    
    try {
        let course = await Course.findOne({code: req.body.code});
        if(course) return res.status(400).send({message: "Course with this code already exists"});

        course = new Course({
            name: req.body.name,
            code: req.body.code,
            profs: req.body.profs,
            TAs: req.body.TAs,
            credit_hours: req.body.credit_hours
        });

        await course.save();
        return res.send({message: `Course '${course.name}' was created successfully`});

    }catch(e){
        return res.status(500).send({message: e.message});
    }
}

async function take_content(req, res){
    const token = req.headers.token;
    if(!token) return res.status(401).send({message: "Forbidden"});

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(payload.role !== "teacher" && payload.role !== "admin") return res.status(401).send({message: "Forbidden"});
        
    try {
        let request = await Course.findOne({code: req.body.code});
        if(!request) return res.status(400).send({message: "Course with this code doesn't exist"});

        //const content = {content: req.body.content}; 
        insert = await Course.findOneAndUpdate({code: req.body.code}, {content: req.body.content});
        return res.send({message: `Course '${req.body.code}' was updated successfully`});
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}

async function get_users_in_course(req, res){
    const token = req.headers.token;
    if(!token) return res.status(401).send("Forbidden");

    const payload = jwt.verify(token, process.env.APP_KEY);
    const course_id = req.params.cours_id;
    try{
        const course = await Course.findById(course_id).populate("User").exec();
        if(!course) return res.status(404).send("Course not found");
        console.log(course);
        res.send({students: course.students.filter(st => st.role === "student")});
    }catch(e){
        return res.status(500).send(e.message);
    }
}


module.exports.create_course = create_course;
module.exports.take_content = take_content;
module.exports.get_users_in_course = get_users_in_course;