const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

router.get('/', async (req, res) => {
  const assignments = await Assignment.find().sort({ createdAt: -1 });
  res.json(assignments);
});

router.get('/:id', async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json(assignment);
});

router.post('/', async (req, res) => {
  const assignment = new Assignment(req.body);
  await assignment.save();
  res.status(201).json(assignment);
});

router.put('/:id', async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json(assignment);
});

router.delete('/:id', async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json({ success: true });
});

module.exports = router;
