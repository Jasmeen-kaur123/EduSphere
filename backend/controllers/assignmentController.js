const Assignment = require('../models/Assignment')

exports.createAssignment = async (req, res) => {
  const payload = {
    title : req.body.title,
    description: req.body.description,
    course: req.body.course,
    dueDate: req.body.dueDate,
    status: req.body.status || 'pending',
    answer: req.body.answer,
    fileUrl: req.body.fileUrl
  }
  if(req.user && req.user.role === 'student') payload.student = req.user.id
  else if(req.body.student) payload.student = req.body.student

  const a = await Assignment.create(payload)
  res.status(201).json(a)
}

exports.getAssignments = async (req, res) => {
  let query = {}

  // Students can see all assignments
  if(req.user && req.user.role === 'student'){
    query = {}
  }

  const list = await Assignment.find(query)
    .populate('course', 'title')
    .populate('student', 'name email')

  res.json(list)
}

exports.submitAssignment = async (req, res) => {
  try{
    const a = await Assignment.findById(req.params.id)
    if(!a) return res.status(404).json({ message: 'Assignment not found' })
    if(String(a.student) !== String(req.user.id)) return res.status(403).json({ message: 'Not your assignment' })
    a.answer = req.body.answer || a.answer
    a.fileUrl = req.body.fileUrl || a.fileUrl
    a.status = 'submitted'
    await a.save()
    return res.json(a)
  }catch(err){ console.error(err); return res.status(500).json({ message: 'Server error' }) }
}

exports.gradeAssignment = async (req, res) => {
  try{
    const a = await Assignment.findById(req.params.id)
    if(!a) return res.status(404).json({ message: 'Assignment not found' })
    if(!req.user || req.user.role !== 'instructor') return res.status(403).json({ message: 'Not authorized' })
    a.score = req.body.score
    a.feedback = req.body.feedback
    a.status = 'graded'
    a.gradedBy = req.user.id
    a.gradedAt = new Date()
    await a.save()
    return res.json(a)
  }catch(err){ console.error(err); return res.status(500).json({ message: 'Server error' }) }
}