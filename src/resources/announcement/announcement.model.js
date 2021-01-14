const mongoose = require("mongoose");


const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    date: { type: Date, default: Date.now },
    course: { type: mongoose.Types.ObjectId, ref: "Course" }
})


const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = { Announcement }
