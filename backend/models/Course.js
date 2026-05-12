// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  ,
  lessons: [
    {
      title: String,
      duration: String,
      videoUrl: String
    }
  ]
});

module.exports = mongoose.model("Course", courseSchema);