const User = require('../models/User')
const Course = require('../models/Course')



// GET /api/instructor/students

exports.getStudents = async (req, res) => {

  try {

    // CURRENT INSTRUCTOR

    const instructorId =
      req.user._id



    // COURSES CREATED BY INSTRUCTOR

    const courses =
      await Course.find({
        instructor: instructorId
      }).select('_id title')



    const courseIds =
      courses.map(c => c._id)



    // NO COURSES

    if (courseIds.length === 0) {

      return res.json([])
    }



    // STUDENTS ENROLLED IN ANY OF THESE COURSES

    const students =
      await User.find({

        role: 'student',

        'enrolledCourses.course': {
          $in: courseIds
        }

      })

      .populate({

        path: 'enrolledCourses.course',

        select: 'title lessons'

      })

      .lean()



    const out = students.map(student => {

      // ONLY COURSES BELONGING TO THIS INSTRUCTOR

      const enrolledCourses =
        (student.enrolledCourses || [])

          .filter(ec => {

            const courseId =
              ec.course?._id || ec.course

            return courseIds.some(

              id =>
                String(id) ===
                String(courseId)

            )
          })



      const enrolledCount =
        enrolledCourses.length



      // CALCULATE AVG PROGRESS

      let totalProgress = 0



      enrolledCourses.forEach(ec => {

        const completedLessons =
          Array.isArray(
            ec.completedLessons
          )
            ? ec.completedLessons.length
            : 0



        const totalLessons =
          Array.isArray(
            ec.course?.lessons
          )
            ? ec.course.lessons.length
            : 0



        const progress =
          totalLessons > 0
            ? (
                completedLessons /
                totalLessons
              ) * 100
            : 0



        totalProgress += progress
      })



      const avgProgress =
        enrolledCount > 0
          ? Math.round(
              totalProgress /
              enrolledCount
            )
          : 0



      return {

        _id: student._id,

        name:
          student.name || 'Student',

        email:
          student.email || '',

        enrolledCount,

        assignmentsSubmitted: 0,

        avgProgress

      }
    })



    return res.json(out)

  } catch (err) {

    console.error(
      'GetStudents error:',
      err
    )

    return res.status(500).json({

      message: 'Server error',

      error: err.message

    })
  }
}



// GET SINGLE STUDENT

exports.getStudentById = async (
  req,
  res
) => {

  try {

    const student =
      await User.findById(
        req.params.id
      )

      .populate(
        'enrolledCourses.course'
      )



    if (!student) {

      return res.status(404).json({

        message: 'Student not found'

      })
    }



    return res.json(student)

  } catch (err) {

    console.error(
      'GetStudentById error:',
      err
    )

    return res.status(500).json({

      message: 'Server error'

    })
  }
}



module.exports = {

  getStudents,

  getStudentById

}