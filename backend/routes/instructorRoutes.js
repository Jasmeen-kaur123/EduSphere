const express = require('express')
const router = express.Router()
const { getStudents, getStudentById } = require('../controllers/instructorController')
const { protect, authorize } = require('../middleware/authMiddleware')

router.get('/students', protect, authorize('instructor'), getStudents)
router.get('/students/:id', protect, authorize('instructor'), getStudentById)

module.exports = router
