const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  dueDate: Date,
  status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'pending' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answer: String,
  fileUrl: String,
  score: Number,
  feedback: String,
  gradedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  gradedAt: Date
}, { timestamps: true })

module.exports = mongoose.model('Assignment', assignmentSchema)