// controllers/courseController.js
const Course = require("../models/Course");

// Instructor creates course
exports.createCourse = async (req, res) => {
  try{
    const { title, description, lessons, category, level, price, duration } = req.body

    // normalize lessons from instructor (frontend uses 'name' for lesson title)
    const normalizedLessons = Array.isArray(lessons) ? lessons.map(ls => ({
      title: ls.title || ls.name || 'Untitled',
      duration: ls.duration || ls.length || '',
      videoUrl: ls.videoUrl || ''
    })) : []

    const course = await Course.create({
      title,
      description,
      instructor: req.user.id,
      lessons: normalizedLessons,
      // optional fields (will be ignored by schema if not present)
      category,
      level,
      price,
      duration
    })

    return res.json(course)
  }catch(err){
    console.error('CreateCourse error', err)
    return res.status(500).json({ message: 'Failed to create course', error: err.message })
  }
};

// Student view courses
exports.getCourses = async (req, res) => {
  const courses = await Course.find().populate("instructor", "name");
  res.json(courses);
};

// Instructor can update course (e.g., add lessons)
exports.updateCourse = async (req, res) => {
  try{
    const course = await Course.findById(req.params.id)
    if(!course) return res.status(404).json({ message: 'Course not found' })
    if(String(course.instructor) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' })

    const { title, description, lessons, category, level, price, duration } = req.body
    if(title) course.title = title
    if(description) course.description = description
    if(typeof category !== 'undefined') course.category = category
    if(typeof level !== 'undefined') course.level = level
    if(typeof price !== 'undefined') course.price = price
    if(typeof duration !== 'undefined') course.duration = duration

    if(Array.isArray(lessons)){
      course.lessons = lessons.map(ls => ({ title: ls.title || ls.name || 'Untitled', duration: ls.duration || '', videoUrl: ls.videoUrl || '' }))
    }

    await course.save()
    return res.json(course)
  }catch(err){
    console.error('UpdateCourse error', err)
    return res.status(500).json({ message: 'Failed to update course', error: err.message })
  }
}