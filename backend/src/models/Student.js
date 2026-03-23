const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  progress: { type: Number, default: 0 },
  completedLessons: { type: Number, default: 0 },
  lastActive: { type: Date, default: () => new Date() },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('Student', StudentSchema);
