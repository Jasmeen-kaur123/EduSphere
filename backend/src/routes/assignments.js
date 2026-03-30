const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

async function isStudentEnrolledInAssignmentCourse(assignment, studentEmail) {
  if (!studentEmail) return false;

  if (assignment.courseId) {
    const courseById = await Course.findById(assignment.courseId, { enrolledStudents: 1 }).lean();
    if (courseById?.enrolledStudents?.some((s) => s.studentEmail === studentEmail)) {
      return true;
    }
  }

  if (assignment.courseName) {
    const courseByName = await Course.findOne(
      { name: assignment.courseName },
      { enrolledStudents: 1 }
    ).lean();
    if (courseByName?.enrolledStudents?.some((s) => s.studentEmail === studentEmail)) {
      return true;
    }
  }

  return false;
}

async function getEnrolledEmailsForAssignment(assignment) {
  let course = null;

  if (assignment.courseId) {
    course = await Course.findById(assignment.courseId, { enrolledStudents: 1 }).lean();
  }

  if (!course && assignment.courseName) {
    course = await Course.findOne(
      { name: assignment.courseName },
      { enrolledStudents: 1 }
    ).lean();
  }

  const enrolledEmails = new Set(
    (course?.enrolledStudents || [])
      .map((student) => String(student?.studentEmail || '').trim().toLowerCase())
      .filter(Boolean)
  );

  return enrolledEmails;
}

async function withDynamicAssignmentStats(assignmentDoc) {
  const assignment = assignmentDoc.toObject ? assignmentDoc.toObject() : assignmentDoc;
  const enrolledEmails = await getEnrolledEmailsForAssignment(assignment);

  const validSubmissions = Array.isArray(assignment.submissions)
    ? assignment.submissions.filter((submission) => {
        const email = String(submission?.studentEmail || '').trim().toLowerCase();
        return email && enrolledEmails.has(email);
      })
    : [];

  const submittedEmails = new Set(
    validSubmissions
      .map((submission) => String(submission?.studentEmail || '').trim().toLowerCase())
      .filter(Boolean)
  );

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const hasValidDueDate = Boolean(dueDate && !Number.isNaN(dueDate.getTime()));

  let lateCount = 0;
  for (const submission of validSubmissions) {
    const submittedAt = submission?.submittedAt ? new Date(submission.submittedAt) : null;
    if (!hasValidDueDate || !submittedAt || Number.isNaN(submittedAt.getTime())) continue;
    if (submittedAt > dueDate) lateCount += 1;
  }

  const total = enrolledEmails.size;
  const submitted = submittedEmails.size;
  const notSubmitted = Math.max(total - submitted, 0);

  return {
    ...assignment,
    submitted,
    total,
    late: lateCount,
    notSubmitted
  };
}

router.get('/', async (req, res) => {
  try {
    const { studentEmail } = req.query;

    if (!studentEmail) {
      const assignments = await Assignment.find().sort({ createdAt: -1 });
      const assignmentsWithStats = await Promise.all(
        assignments.map((assignment) => withDynamicAssignmentStats(assignment))
      );
      return res.json(assignmentsWithStats);
    }

    const enrolledCourses = await Course.find(
      { 'enrolledStudents.studentEmail': studentEmail },
      { _id: 1, name: 1 }
    ).lean();

    if (enrolledCourses.length === 0) {
      return res.json([]);
    }

    const enrolledCourseIds = enrolledCourses.map((course) => course._id);
    const enrolledCourseNames = enrolledCourses.map((course) => course.name);

    const assignments = await Assignment.find({
      $or: [
        { courseId: { $in: enrolledCourseIds } },
        { courseName: { $in: enrolledCourseNames } }
      ]
    }).sort({ createdAt: -1 });

    // Hide accidental duplicate records for students (same title/course/due date)
    const uniqueAssignments = [];
    const seenKeys = new Set();

    for (const assignment of assignments) {
      const normalizedTitle = String(assignment.title || '').trim().toLowerCase();
      const normalizedCourse = String(assignment.courseId || assignment.courseName || '').trim().toLowerCase();
      const normalizedDueDate = assignment.dueDate
        ? new Date(assignment.dueDate).toISOString().slice(0, 10)
        : '';

      const dedupeKey = `${normalizedTitle}|${normalizedCourse}|${normalizedDueDate}`;
      if (seenKeys.has(dedupeKey)) continue;

      seenKeys.add(dedupeKey);
      uniqueAssignments.push(assignment);
    }

    const uniqueAssignmentsWithStats = await Promise.all(
      uniqueAssignments.map((assignment) => withDynamicAssignmentStats(assignment))
    );

    return res.json(uniqueAssignmentsWithStats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json(assignment);
});

router.post('/:id/submit', async (req, res) => {
  try {
    const { studentName, studentEmail, answers } = req.body;

    if (!studentName || !studentEmail) {
      return res.status(400).json({ error: 'Student name and email are required' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const isEnrolled = await isStudentEnrolledInAssignmentCourse(assignment, studentEmail);
    if (!isEnrolled) {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    const normalizedAnswers = Array.isArray(answers)
      ? answers
          .map((item) => ({
            questionText: String(item?.questionText || '').trim(),
            answerText: String(item?.answerText || '').trim()
          }))
          .filter((item) => item.questionText.length > 0)
      : [];

    const existingIndex = assignment.submissions.findIndex(
      (s) => s.studentEmail === studentEmail
    );

    const submissionPayload = {
      studentName,
      studentEmail,
      answers: normalizedAnswers,
      submittedAt: new Date(),
      status: 'Submitted'
    };

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex] = {
        ...assignment.submissions[existingIndex].toObject(),
        ...submissionPayload
      };
    } else {
      assignment.submissions.push(submissionPayload);
    }

    await assignment.save();

    return res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const payload = { ...req.body };

  if (payload.courseId && !payload.courseName) {
    const course = await Course.findById(payload.courseId, { name: 1 }).lean();
    if (course?.name) {
      payload.courseName = course.name;
    }
  }

  const assignment = new Assignment(payload);
  await assignment.save();
  res.status(201).json(assignment);
});

router.put('/:id', async (req, res) => {
  const payload = { ...req.body };

  if (payload.courseId && !payload.courseName) {
    const course = await Course.findById(payload.courseId, { name: 1 }).lean();
    if (course?.name) {
      payload.courseName = course.name;
    }
  }

  const assignment = await Assignment.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json(assignment);
});

router.delete('/:id', async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json({ success: true });
});

module.exports = router;
