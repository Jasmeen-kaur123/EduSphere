// routes/courseRoutes.js
const express = require("express");
const router = express.Router();

const { createCourse, getCourses } = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Instructor only
router.post("/", protect, authorize("instructor"), createCourse);

// Both can view
router.get("/", protect, getCourses);

module.exports = router;