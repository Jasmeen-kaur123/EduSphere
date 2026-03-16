const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  submitted: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  late: { type: Number, default: 0 },
  notSubmitted: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
