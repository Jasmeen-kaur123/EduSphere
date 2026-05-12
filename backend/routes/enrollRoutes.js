const express = require('express')
const router = express.Router()
const { enroll, myCourses, getCourse, completeLesson } = require('../controllers/enrollController')
const { protect } = require('../middleware/authMiddleware')

// simple logger for enroll routes
router.use((req, res, next) => {
	const uid = req.user ? req.user.id : 'anon'
	console.log('[ENROLL ROUTE]', req.method, req.originalUrl, 'user=', uid)
	next()
})


router.post('/enroll', protect, enroll)
router.get('/me', protect, myCourses)
router.get('/course/:id', protect, getCourse)
router.post('/complete', protect, completeLesson)

module.exports = router



