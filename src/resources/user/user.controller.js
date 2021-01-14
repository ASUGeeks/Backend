const bcrypt = require("bcrypt");
const { User, validateUser, validateUserData } = require("./user.model.js");
const jwt = require("jsonwebtoken");


const login = async function (req, res) {
    /**
     * req.body: {
     *     "username": String,
     *     "password": String
     * }
     */

    const result = validateUser(req.body);
    if (result) return res.status(400).send(result);

    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).send("Wrong username or password");

        const authenticated = await bcrypt.compare(req.body.password, user.password);
        if (!authenticated) return res.status(400).send("Wrong username or password");

        const token = await user.generateAuthToken();
        res.json({ token: token, role: user.role, username: user.username, email: user.email });
    } catch (e) {
        return res.status(500).send(e.message);
    }
}


const getCourses = async function (req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload) return res.status(401).send({message: "Forbidden"});

    try {
        const user = await User.findById(payload.user_id).populate({
            path: "courses",
            populate: [{path: "quizes"}, {path: "announcements"}]
        })
        .exec();

        res.send({ message: "Success", courses: user.courses });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}


const getUsers = async function (req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if(!payload || payload.role !== "admin") return res.status(401).send({message: "Forbidden"});

    try {
        const users = await User.find({});
        res.send({
            message: "Success",
            teachers: users.filter(user => user.role === "teacher"),
            students: users.filter(user => user.role === "student")
        });
    } catch (e) {
        return res.status(500).send({ message: e.message });
    }
}



const createAccount = async function (req, res) {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ message: "Forbidden" });

    const payload = jwt.verify(token, process.env.APP_KEY);
    if (payload.role !== "admin") return res.status(401).send({ message: "Forbidden" });

    const err = validateUserData(req.body);
    if (err) return res.status(400).send({ message: err });

    try {
        let user = await User.findOne({
            username: req.body.username.toLowerCase()
        });
        if (user)
            return res
                .status(400)
                .send({message: `Username: ${req.body.username} already exists`});

        user = new User({
            username: req.body.username,
            role: req.body.role,
            email: req.body.email
        });

        const salt = await bcrypt.genSalt(10);
        const crypted_pwd = await bcrypt.hash(req.body.password, salt);
        user.password = crypted_pwd;

        await user.save();

        res.send({ message: `user '${user.username}' was created successfully` });

    } catch (e) {
        return res.status(500).send({ message: `Server Error: ${e.message}` });
    }
}

module.exports = { login, createAccount, getCourses, getUsers };