const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');

router.get('/', async (req, res) => {
  const courses = await Course.find({}, { enrolledStudents: 1 }).lean();
  const enrollmentMap = new Map();

  courses.forEach((course) => {
    const enrolled = Array.isArray(course?.enrolledStudents) ? course.enrolledStudents : [];
    enrolled.forEach((student) => {
      const email = String(student?.studentEmail || '').trim().toLowerCase();
      const name = String(student?.studentName || '').trim();
      if (!email) return;
      if (!enrollmentMap.has(email)) {
        enrollmentMap.set(email, { email, name: name || 'Student' });
      }
    });
  });

  const enrollmentEntries = Array.from(enrollmentMap.values());
  if (enrollmentEntries.length > 0) {
    await Student.bulkWrite(
      enrollmentEntries.map((entry) => ({
        updateOne: {
          filter: { email: entry.email },
          update: {
            $set: {
              name: entry.name,
              email: entry.email,
              lastActive: new Date(),
              status: 'Active'
            },
            $setOnInsert: {
              progress: 0,
              completedLessons: 0,
              createdAt: new Date()
            }
          },
          upsert: true
        }
      }))
    );
  }

  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

router.get('/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/', async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.status(201).json(student);
});

router.put('/:id', async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.delete('/:id', async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json({ success: true });
});

module.exports = router;
