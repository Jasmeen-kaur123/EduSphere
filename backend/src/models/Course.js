const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  instructor: { type: String, default: 'Unknown Instructor' },
  category: { type: String, default: 'General' },
  students: { type: Number, default: 0 },
  enrolledStudents: [{
    studentName: String,
    studentEmail: String,
    enrolledAt: { type: Date, default: () => new Date() }
  }],
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date()}
});

module.exports = mongoose.model("Course", courseSchema);
