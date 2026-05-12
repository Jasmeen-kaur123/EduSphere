const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "instructor"],
    required: true
  }
  ,
  enrolledCourses: [
    {course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedLessons: [{ type: Number }]
    }
  ]
});
module.exports = mongoose.model("User", userSchema);