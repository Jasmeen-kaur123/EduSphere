const User = require('../models/User')
const Course = require('../models/Course')

exports.enroll = async (req, res) => {
  try{
    const userId = req.user.id
    const { courseId } = req.body

    if(!courseId){
      return res.status(400).json({
        message: 'courseId required'
      })
    }
    const course = await Course.findById(courseId)

    if(!course){
      return res.status(404).json({
        message: 'Course not found'
      })
    }

    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({
        message: 'User not found'
      })
    }

    user.enrolledCourses =
      user.enrolledCourses || []

    const exists =
      user.enrolledCourses.find(
        ec => String(ec.course) === String(courseId)
      )

    if(exists){

      return res.json({
        message: 'Already enrolled'
      })
    }

    user.enrolledCourses.push({
      course: courseId,
      completedLessons: []
    })

    await user.save()

    return res.json({
      message: 'Enrolled successfully',
      course
    })

  }catch(err){

    console.error('Enroll error', err)

    return res.status(500).json({
      message: 'Server error'
    })
  }
}

exports.myCourses = async (req, res) => {

  try{

    const user = await User.findById(req.user.id)
      .populate({
        path: 'enrolledCourses.course',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })

    if(!user){

      return res.status(404).json({
        message: 'User not found'
      })
    }

    const out = (user.enrolledCourses || []).map(ec => {

      const courseObj = ec.course

      const totalLessons =
        courseObj.lessons?.length || 1

      const completedLessons =
        ec.completedLessons || []

      const progress = Math.round(
        (completedLessons.length / totalLessons) * 100
      )

      return {

        ...courseObj.toObject(),

        completedLessons,

        progress,

        lastLesson:
          completedLessons.length > 0
            ? completedLessons[
                completedLessons.length - 1
              ]
            : 0
      }
    })

    return res.json(out)

  }catch(err){

    console.error('MyCourses error', err)

    return res.status(500).json({
      message: 'Server error'
    })
  }
}

exports.getCourse = async (req, res) => {

  try{

    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name')

    if(!course){

      return res.status(404).json({
        message: 'Course not found'
      })
    }

    let completedLessons = []

    try{

      const user = await User.findById(req.user.id)

      const ec =
        (user.enrolledCourses || []).find(
          x => String(x.course) === String(req.params.id)
        )

      if(ec && Array.isArray(ec.completedLessons)){

        completedLessons = ec.completedLessons
      }

    }catch(e){
      console.log(e)
    }

    return res.json({
      course,
      completedLessons
    })

  }catch(err){

    console.error('GetCourse error', err)

    return res.status(500).json({
      message: 'Server error'
    })
  }
}

exports.completeLesson = async (req, res) => {

  try{

    const userId = req.user.id

    const {
      courseId,
      lessonIndex
    } = req.body

    if(typeof lessonIndex !== 'number'){

      return res.status(400).json({
        message: 'lessonIndex required'
      })
    }

    const user = await User.findById(userId)

    if(!user){

      return res.status(404).json({
        message: 'User not found'
      })
    }

    const ec =
      user.enrolledCourses.find(
        x => String(x.course) === String(courseId)
      )

    if(!ec){

      return res.status(400).json({
        message: 'Not enrolled'
      })
    }

    ec.completedLessons =
      ec.completedLessons || []

    if(
      !ec.completedLessons.includes(lessonIndex)
    ){

      ec.completedLessons.push(lessonIndex)
    }

    await user.save()

    return res.json({
      message: 'Lesson completed',
      completedLessons: ec.completedLessons
    })

  }catch(err){

    console.error('CompleteLesson error', err)

    return res.status(500).json({
      message: 'Server error'
    })
  }
}

