require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB setup
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edusphere';
mongoose
	.connect(mongoUri)
	.then(async () => {
		console.log('✅ Connected to MongoDB');

		// Seed sample data if missing (optional)
		const Course = require('./models/Course');
		const Assignment = require('./models/Assignment');
		const Exam = require('./models/Exam');
		const Student = require('./models/Student');

		const defaultStudentProfiles = [
			{ name: 'Brenda M. Stroman', email: 'brenda@example.com' },
			{ name: 'Mark J. Lopez', email: 'mark@example.com' },
			{ name: 'Doris J. Bartlett', email: 'doris@example.com' }
		];

		const getFallbackEmailFromName = (name, index = 0) => {
			const base = String(name || `student-${index + 1}`)
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '.')
				.replace(/^\.+|\.+$/g, '');
			return `${base || `student-${index + 1}`}@example.com`;
		};

		const buildAssignmentSubmissions = (students, baseDate) =>
			students.map((student, index) => ({
				studentName: student.name,
				studentEmail: student.email || getFallbackEmailFromName(student.name, index),
				submittedAt: new Date(baseDate.getTime() - index * 6 * 60 * 60 * 1000),
				status: index === 0 ? 'Submitted' : 'Reviewed',
				score: 78 + index * 6
			}));

		const buildExamResults = (studentNames, baseDate, totalMarks) =>
			studentNames.map((studentName, index) => {
				const score = Math.min(totalMarks, 68 + index * 10);
				return {
					studentName,
					submittedAt: new Date(baseDate.getTime() - index * 8 * 60 * 60 * 1000),
					score,
					percentage: Math.round((score / totalMarks) * 100),
					status: score >= totalMarks * 0.4 ? 'Passed' : 'Needs Review'
				};
			});

		const courseCount = await Course.countDocuments();
		if (courseCount === 0) {
			const seededStudents = defaultStudentProfiles;

			const courseA = await Course.create({
				name: 'Web Development Fundamentals',
				description: 'Learn the basics of web development with HTML, CSS, and JavaScript',
				duration: 8,
				students: 150,
				published: true
			});

			const courseB = await Course.create({
				name: 'Advanced JavaScript',
				description: 'Master advanced concepts in JavaScript for professional development',
				duration: 12,
				students: 120,
				published: false
			});

			await Assignment.create({
				title: 'HTML & CSS Basics',
				description: 'Create a responsive website layout using HTML5 and modern CSS3 techniques',
				dueDate: new Date('2026-03-15'),
				courseId: courseA._id,
				submissions: buildAssignmentSubmissions(seededStudents, new Date('2026-03-14T15:00:00Z')),
				submitted: 45,
				total: 50,
				late: 5,
				notSubmitted: 0
			});

			await Assignment.create({
				title: 'JavaScript Functions',
				description: 'Write JavaScript functions to solve complex problems and demonstrate understanding',
				dueDate: new Date('2026-03-20'),
				courseId: courseB._id,
				submissions: buildAssignmentSubmissions(seededStudents, new Date('2026-03-17T10:30:00Z')),
				submitted: 38,
				total: 50,
				late: 2,
				notSubmitted: 10
			});

			await Exam.create({
				title: 'Mid Term - Web Development',
				date: new Date('2026-03-20'),
				time: '10:00',
				duration: 120,
				totalMarks: 100,
				passingScore: 40,
				courseId: courseA._id,
				results: buildExamResults(seededStudents, new Date('2026-03-16T12:00:00Z'), 100),
				completed: 45,
				inProgress: 3,
				notAttended: 2,
				active: true
			});

			await Exam.create({
				title: 'Quiz - JavaScript Basics',
				date: new Date('2026-03-25'),
				time: '14:00',
				duration: 60,
				totalMarks: 50,
				passingScore: 25,
				courseId: courseB._id,
				results: buildExamResults(seededStudents, new Date('2026-03-17T09:15:00Z'), 50),
				completed: 20,
				inProgress: 5,
				notAttended: 10,
				active: false
			});

			await Student.create({
				name: 'Brenda M. Stroman',
				email: 'brenda@example.com',
				progress: 75,
				completedLessons: 6,
				lastActive: new Date(),
				status: 'Active'
			});

			await Student.create({
				name: 'Mark J. Lopez',
				email: 'mark@example.com',
				progress: 50,
				completedLessons: 4,
				lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
				status: 'Inactive'
			});

			console.log('✨ Seeded sample data');
		}

		const existingStudents = await Student.find().sort({ createdAt: 1 }).lean();
		const studentProfiles = existingStudents.length > 0
			? existingStudents.map((student, index) => ({
				name: student.name,
				email: student.email || getFallbackEmailFromName(student.name, index)
			}))
			: defaultStudentProfiles;
		const studentNameToEmail = new Map(
			studentProfiles.map((student) => [student.name, student.email])
		);
		const studentNames = studentProfiles.map((student) => student.name);

		const existingAssignments = await Assignment.find();
		for (const assignment of existingAssignments) {
			if (!Array.isArray(assignment.submissions) || assignment.submissions.length === 0) {
				assignment.submissions = buildAssignmentSubmissions(studentProfiles, assignment.dueDate || new Date());
				await assignment.save();
				continue;
			}

			let updated = false;
			assignment.submissions = assignment.submissions.map((submission, index) => {
				const existingEmail = submission.studentEmail;
				if (existingEmail) return submission;

				updated = true;
				const derivedEmail = studentNameToEmail.get(submission.studentName)
					|| getFallbackEmailFromName(submission.studentName, index);

				return {
					...submission.toObject(),
					studentEmail: derivedEmail
				};
			});

			if (updated) {
				await assignment.save();
			}
		}

		const existingExams = await Exam.find();
		for (const exam of existingExams) {
			if (!Array.isArray(exam.results) || exam.results.length === 0) {
				exam.results = buildExamResults(studentNames, exam.date || new Date(), exam.totalMarks || 100);
				await exam.save();
			}
		}
	})
	.catch((err) => console.error('❌ MongoDB connection error:', err));

// Serve backend public files FIRST (signup, login, etc)
const backendPublicPath = path.join(__dirname, '..', 'public');
app.use(express.static(backendPublicPath));

// Serve instructor dashboard frontend
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'instructor-dashboard');
app.use('/instructor-dashboard', express.static(frontendPath));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/students', require('./routes/students'));
app.use('/api/storage', require('./routes/storage'));

// Routes for instructor dashboard SPA
app.get('/instructor-dashboard', (req, res) => {
	res.sendFile(path.join(frontendPath, 'index.html'));
});

// Route for admin dashboard
app.get('/admin-dashboard', (req, res) => {
	res.sendFile(path.join(backendPublicPath, 'admin-dashboard.html'));
});

// Help page route
app.get('/help-page', (req, res) => {
	console.log("🔥 HELP PAGE HIT");
	res.sendFile(path.join(frontendPath, 'help.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`🚀 Server running on http://localhost:${port}`);
});