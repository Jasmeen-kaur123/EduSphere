const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  passingScore: { type: Number, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  results: {
    type: [
      {
        studentName: { type: String, required: true },
        submittedAt: { type: Date, required: true },
        score: { type: Number, required: true },
        percentage: { type: Number, required: true },
        status: { type: String, default: 'Completed' }
      }
    ],
    default: []
  },
  completed: { type: Number, default: 0 },
  inProgress: { type: Number, default: 0 },
  notAttended: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('Exam', ExamSchema);
