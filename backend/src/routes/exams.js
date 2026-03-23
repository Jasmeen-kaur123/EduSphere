const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

router.get('/', async (req, res) => {
  const exams = await Exam.find().sort({ createdAt: -1 });
  res.json(exams);
});

router.get('/:id', async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json(exam);
});

router.post('/', async (req, res) => {
  const exam = new Exam(req.body);
  await exam.save();
  res.status(201).json(exam);
});

router.put('/:id', async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json(exam);
});

router.delete('/:id', async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json({ success: true });
});

module.exports = router;
