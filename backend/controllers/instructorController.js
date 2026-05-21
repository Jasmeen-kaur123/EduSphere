const User = require('../models/User')
const Course = require('../models/Course')

// GET /api/instructor/students
const getStudents = async (req, res) => {
  try {
    const instructorId = req.user.id || req.user._id

    const courses = await Course.find({
      instructor: instructorId
    }).select('_id title')

    const courseIds = courses.map(c => c._id)

    if (courseIds.length === 0) {
      return res.json([])
    }

    const students = await User.find({
      role: 'student',
      'enrolledCourses.course': { $in: courseIds }
    })
      .populate({
        path: 'enrolledCourses.course',
        select: 'title lessons'
      })
      .lean()

    const out = students.map(student => {
      const enrolledCourses = (student.enrolledCourses || []).filter(ec => {
        const courseId = ec.course?._id || ec.course

        return courseIds.some(
          id => String(id) === String(courseId)
        )
      })

      const enrolledCount = enrolledCourses.length

      let totalProgress = 0

      enrolledCourses.forEach(ec => {
        const completedLessons =
          Array.isArray(ec.completedLessons)
            ? ec.completedLessons.length
            : 0

        const totalLessons =
          Array.isArray(ec.course?.lessons)
            ? ec.course.lessons.length
            : 0

        const progress =
          totalLessons > 0
            ? (completedLessons / totalLessons) * 100
            : 0

        totalProgress += progress
      })

      const avgProgress =
        enrolledCount > 0
          ? Math.round(totalProgress / enrolledCount)
          : 0

      return {
        _id: student._id,
        name: student.name || 'Student',
        email: student.email || '',
        enrolledCount,
        assignmentsSubmitted: 0,
        avgProgress,
        createdAt: student.createdAt
      }
    })

    res.json(out)

  } catch (err) {
    console.error('GetStudents error:', err)

    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
}

// GET SINGLE STUDENT
const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate('enrolledCourses.course')

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      })
    }

    res.json(student)

  } catch (err) {
    console.error('GetStudentById error:', err)

    res.status(500).json({
      message: 'Server error'
    })
  }
}

module.exports = {
  getStudents,
  getStudentById
}