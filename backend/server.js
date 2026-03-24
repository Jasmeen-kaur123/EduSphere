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
	.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(async () => {
		console.log('✅ Connected to MongoDB');

		// Seed sample data if missing (optional)
		const Course = require('./src/models/Course');
		const Assignment = require('./src/models/Assignment');
		const Exam = require('./src/models/Exam');
		const Student = require('./src/models/Student');

		const courseCount = await Course.countDocuments();
		if (courseCount === 0) {
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
	})
	.catch((err) => console.error('❌ MongoDB connection error:', err));

// API routes
app.use('/api/courses', require('./src/routes/courses'));
app.use('/api/assignments', require('./src/routes/assignments'));
app.use('/api/exams', require('./src/routes/exams'));
app.use('/api/students', require('./src/routes/students'));
app.use('/api/storage', require('./src/routes/storage'));

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'Frontend', 'instructor-dashboard');
app.use(express.static(frontendPath));

// Ensure SPA routing works (Catch-all route)
app.get(/.*/, (req, res) => {
	res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`🚀 Server running on http://localhost:${port}`);
});