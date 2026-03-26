// controllers/courseController.js
const Course = require("../models/Course");

// Instructor creates course
exports.createCourse = async (req, res) => {
  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    instructor: req.user.id
  });

  res.json(course);
};

// Student view courses
exports.getCourses = async (req, res) => {
  const courses = await Course.find().populate("instructor", "name");
  res.json(courses);
};