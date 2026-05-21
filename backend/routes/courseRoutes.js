// routes/courseRoutes.js
const express = require("express");
const router = express.Router();

const { createCourse, getCourses, updateCourse,  getCourseById,
  getInstructorCourses } = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Instructor only
router.post("/", protect, authorize("instructor"), createCourse);

// Both can view
router.get("/", protect, getCourses);

router.get(
  '/instructor',
  protect,
  authorize('instructor'),
  getInstructorCourses
)
router.get(
  "/:id",
  protect,
  authorize("instructor"),
  getCourseById
)

// Instructor updates course (lessons etc.)
router.patch("/:id", protect, authorize("instructor"), updateCourse);

module.exports = router;