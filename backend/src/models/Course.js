const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
   name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  students: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date()}
});

module.exports = mongoose.model("Course", courseSchema);