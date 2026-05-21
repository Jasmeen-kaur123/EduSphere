const express = require('express')

const router = express.Router()

const {
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeAssignment
} = require('../controllers/assignmentController')

const {
  protect,
  authorize
} = require('../middleware/authMiddleware')



// CREATE ASSIGNMENT

router.post(
  '/',
  protect,
  createAssignment
)



// GET ASSIGNMENTS

router.get(
  '/',
  protect,
  getAssignments
)



// SUBMIT ASSIGNMENT

router.post(
  '/:id/submit',
  protect,
  submitAssignment
)



// GRADE ASSIGNMENT

router.post(
  '/:id/grade',
  protect,
  authorize('instructor'),
  gradeAssignment
)


const upload =
require("../middleware/upload")

router.post(
  "/:id/submit",
  protect,
  upload.single("file"),
  submitAssignment
)


module.exports = router