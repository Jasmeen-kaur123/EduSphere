const User = require('../models/User')
const Course = require('../models/Course')

// GET /api/instructor/students
exports.getStudents = async (req, res) => {
  try{
    const instructorId = req.user.id
    // find courses taught by this instructor
    const courses = await Course.find({ instructor: instructorId }).select('_id')
    const courseIds = courses.map(c=> String(c._id))
    // find students who are enrolled in any of these courses and populate the enrolled course refs
    const students = await User.find({ role: 'student', 'enrolledCourses.course': { $in: courseIds } })
      .populate({ path: 'enrolledCourses.course', select: 'lessons title' })
      .lean()
    // build aggregated view
    const out = students.map(s => {
      const enrolled = (s.enrolledCourses || []).filter(ec => courseIds.includes(String(ec.course && ec.course._id ? ec.course._id : ec.course)))
      const enrolledCount = enrolled.length
      // compute average progress across enrolled courses (per-course completedLessons / total lessons)
      let progressSum = 0
      enrolled.forEach(ec => {
        const completed = Array.isArray(ec.completedLessons) ? ec.completedLessons.length : 0
        const totalLessons = (ec.course && ec.course.lessons) ? ec.course.lessons.length : 0
        const pct = totalLessons ? (completed / totalLessons) : 0
        progressSum += pct
      })
      const avgProgress = enrolledCount ? Math.round((progressSum / enrolledCount) * 100) : 0
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        enrolledCount,
        assignmentsSubmitted: 0, 
        avgProgress
      }
    })

    return res.json(out)
  }catch(err){
    console.error('GetStudents error', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
}

exports.getStudentById = async (req,res) => {
  try{
    const student = await User.findById(req.params.id).populate('enrolledCourses.course')
    if(!student) return res.status(404).json({ message: 'Not found' })
    return res.json(student)
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }

}
module.exports = exports
