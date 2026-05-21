const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')



// CREATE ASSIGNMENT

exports.createAssignment = async (req, res) => {

  try {

    const assignment = await Assignment.create({

      title: req.body.title,

      description: req.body.description,

      course: req.body.course,

      dueDate: req.body.dueDate,

      createdBy: req.user.id

    })

    return res.status(201).json(assignment)

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      message: 'Server error'
    })
  }
}




// GET ASSIGNMENTS



// GET ASSIGNMENTS
exports.getAssignments = async (req, res) => {

  try {

    let assignments

    // INSTRUCTOR

    if (req.user.role === 'instructor') {

      assignments = await Assignment.find({

        createdBy: req.user.id

      })

      .populate('course')

      .lean()



      // ADD SUBMISSIONS

      for (let assignment of assignments) {

        const submissions =
          await Submission.find({

            assignment: assignment._id

          })

          .populate('student', 'name email')



        assignment.submissions = submissions
      }

    }

    // STUDENT

    else {

      assignments = await Assignment.find()

        .populate('course')

        .lean()



      for (let assignment of assignments) {

        const submission =
          await Submission.findOne({

            assignment: assignment._id,

            student: req.user.id

          })



        assignment.submission = submission
      }
    }



    return res.json(assignments)

  } catch (err) {

    console.error(err)

    return res.status(500).json({

      message: 'Server error'
    })
  }
}


// SUBMIT ASSIGNMENT

exports.submitAssignment = async (req, res) => {

  try {

    console.log('SUBMIT API HIT')

    const assignment =
      await Assignment.findById(req.params.id)

    if (!assignment) {

      return res.status(404).json({
        message: 'Assignment not found'
      })
    }



    // ONLY STUDENT CAN SUBMIT

    if (req.user.role !== 'student') {

      return res.status(403).json({
        message: 'Only students can submit assignments'
      })
    }



    // FIND EXISTING SUBMISSION

    let submission =
      await Submission.findOne({

        assignment: assignment._id,

        student: req.user.id

      })



    // CREATE NEW SUBMISSION

    if (!submission) {

      submission = new Submission({

        assignment: assignment._id,

        student: req.user.id

      })
    }



    // UPDATE DATA

    submission.answer =
      req.body.answer || ''

    if (req.file) {
  submission.fileUrl =
    `/uploads/${req.file.filename}`
}

    submission.status = 'submitted'



    // SAVE

    const savedSubmission =
      await submission.save()



    console.log(savedSubmission)



    return res.json(savedSubmission)

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      message: 'Server error'
    })
  }
}




// GRADE ASSIGNMENT

exports.gradeAssignment = async (req, res) => {

  try {

    if (req.user.role !== 'instructor') {

      return res.status(403).json({
        message: 'Not authorized'
      })
    }



    const submission =
      await Submission.findById(req.params.id)



    if (!submission) {

      return res.status(404).json({
        message: 'Submission not found'
      })
    }



    submission.score = req.body.score

    submission.feedback = req.body.feedback

    submission.status = 'graded'

    submission.gradedBy = req.user.id

    submission.gradedAt = new Date()



    await submission.save()



    return res.json(submission)

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      message: 'Server error'
    })
  }
}