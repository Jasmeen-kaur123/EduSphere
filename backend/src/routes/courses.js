const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

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
  const { name, description, duration, students, published } = req.body;
  const course = new Course({ name, description, duration, students, published });
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

module.exports = router;
