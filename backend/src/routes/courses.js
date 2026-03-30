const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Student = require('../models/Student');

// List all courses
router.get('/', async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
});

// Get course by id
router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// Create course
router.post('/', async (req, res) => {
  const { name, description, duration, students, published, instructor, category } = req.body;
  const course = new Course({
    name,
    description,
    duration,
    students,
    published,
    instructor: instructor || 'Unknown Instructor',
    category: category || 'General'
  });
  await course.save();
  res.status(201).json(course);
});

// Update course
router.put('/:id', async (req, res) => {
  const updates = req.body;
  const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// Delete course
router.delete('/:id', async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ success: true });
});

// Enroll student in course
router.post('/:id/enroll', async (req, res) => {
  const { studentName, studentEmail } = req.body;
  const courseId = req.params.id;
  
  if (!studentName || !studentEmail) {
    return res.status(400).json({ error: 'Student name and email required' });
  }
  
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Keep students collection in sync with enrollments
    await Student.findOneAndUpdate(
      { email: studentEmail },
      {
        $set: {
          name: studentName,
          email: studentEmail,
          lastActive: new Date(),
          status: 'Active'
        },
        $setOnInsert: {
          progress: 0,
          completedLessons: 0,
          createdAt: new Date()
        }
      },
      { new: true, upsert: true }
    );
    
    // Check if student already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      s => s.studentEmail === studentEmail
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Student already enrolled in this course' });
    }
    
    // Add student to enrolled list
    course.enrolledStudents.push({
      studentName,
      studentEmail,
      enrolledAt: new Date()
    });
    
    // Update student count
    course.students = course.enrolledStudents.length;
    
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
