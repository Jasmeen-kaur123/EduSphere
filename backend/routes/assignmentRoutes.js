const express = require('express')
const router = express.Router()
const {createAssignment, getAssignments, submitAssignment, gradeAssignment} = require('../controllers/assignmentController')
const {protect, authorize} = require('../middleware/authMiddleware')

router.post('/', protect, createAssignment)
router.get('/', protect, getAssignments)
router.post('/:id/submit', protect, submitAssignment)
router.post('/:id/grade', protect, authorize('instructor'), gradeAssignment)

module.exports = router
