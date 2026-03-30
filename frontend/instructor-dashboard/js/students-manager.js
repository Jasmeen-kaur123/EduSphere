// Student View - Load enrolled students from courses
async function loadStudentsFromStorage() {
  try {
    // Fetch all courses to get enrolled students
    const courses = await fetchCourses();
    let assignments = [];
    let exams = [];

    try {
      assignments = await apiFetch('/api/assignments');
      if (!Array.isArray(assignments)) assignments = [];
    } catch {
      assignments = [];
    }

    try {
      exams = await apiFetch('/api/exams');
      if (!Array.isArray(exams)) exams = [];
    } catch {
      exams = [];
    }

    const totalWorkItems = assignments.length + exams.length;

    const assignmentSubmissionByEmail = new Map();
    const assignmentLastActiveByEmail = new Map();

    assignments.forEach((assignment) => {
      const submissions = Array.isArray(assignment?.submissions) ? assignment.submissions : [];
      submissions.forEach((submission) => {
        const email = String(submission?.studentEmail || '').trim().toLowerCase();
        if (!email) return;

        assignmentSubmissionByEmail.set(email, (assignmentSubmissionByEmail.get(email) || 0) + 1);

        const submittedAt = submission?.submittedAt ? new Date(submission.submittedAt) : null;
        if (submittedAt && !Number.isNaN(submittedAt.getTime())) {
          const current = assignmentLastActiveByEmail.get(email);
          if (!current || submittedAt > current) {
            assignmentLastActiveByEmail.set(email, submittedAt);
          }
        }
      });
    });

    const examCompletionByStudentKey = new Map();
    const examLastActiveByStudentKey = new Map();

    exams.forEach((exam) => {
      const results = Array.isArray(exam?.results) ? exam.results : [];
      results.forEach((result) => {
        const keyByName = String(result?.studentName || '').trim().toLowerCase();
        if (!keyByName) return;

        examCompletionByStudentKey.set(keyByName, (examCompletionByStudentKey.get(keyByName) || 0) + 1);

        const submittedAt = result?.submittedAt ? new Date(result.submittedAt) : null;
        if (submittedAt && !Number.isNaN(submittedAt.getTime())) {
          const current = examLastActiveByStudentKey.get(keyByName);
          if (!current || submittedAt > current) {
            examLastActiveByStudentKey.set(keyByName, submittedAt);
          }
        }
      });
    });
    
    // Extract all enrolled students from courses
    const allEnrolledStudents = [];
    const studentMap = new Map();
    
    courses.forEach(course => {
      if (course.enrolledStudents && Array.isArray(course.enrolledStudents)) {
        course.enrolledStudents.forEach(student => {
          // Use email as unique key to avoid duplicates
          const key = String(student.studentEmail || '').trim().toLowerCase();
          if (!key) return;
          const nameKey = String(student.studentName || '').trim().toLowerCase();

          const assignmentCompleted = assignmentSubmissionByEmail.get(key) || 0;
          const examCompleted = examCompletionByStudentKey.get(nameKey) || 0;
          const completedWork = assignmentCompleted + examCompleted;
          const progress = totalWorkItems > 0
            ? Math.min(100, Math.round((completedWork / totalWorkItems) * 100))
            : 0;

          const assignmentLastActive = assignmentLastActiveByEmail.get(key);
          const examLastActive = examLastActiveByStudentKey.get(nameKey);
          const enrolledAt = student.enrolledAt ? new Date(student.enrolledAt) : null;
          const candidates = [assignmentLastActive, examLastActive, enrolledAt]
            .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()));
          const lastActive = candidates.length > 0
            ? new Date(Math.max(...candidates.map((date) => date.getTime())))
            : new Date();

          const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          const status = daysSinceActive <= 30 ? 'Active' : 'Inactive';

          if (!studentMap.has(key)) {
            studentMap.set(key, {
              name: student.studentName,
              email: key,
              progress,
              completedLessons: completedWork,
              lastActive,
              status,
              courses: [course.name]
            });
          } else {
            // Add course to existing student's course list
            const existingStudent = studentMap.get(key);
            if (!existingStudent.courses.includes(course.name)) {
              existingStudent.courses.push(course.name);
            }

            // Merge latest progress/activity for students in multiple courses
            existingStudent.completedLessons = Math.max(existingStudent.completedLessons, completedWork);
            existingStudent.progress = Math.max(existingStudent.progress, progress);
            if (lastActive > new Date(existingStudent.lastActive)) {
              existingStudent.lastActive = lastActive;
            }
            existingStudent.status = status;
          }
        });
      }
    });
    
    const students = Array.from(studentMap.values());
    const tbody = document.querySelector('.student-table tbody');
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No students enrolled yet</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    students.forEach((student) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${student.progress}%"></div>
          </div>
          <span class="progress-text">${student.progress}%</span>
        </td>
        <td>${student.completedLessons}</td>
        <td>${new Date(student.lastActive).toLocaleString()}</td>
        <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
        <td><button class="btn-view">View</button></td>
      `;

      const viewBtn = tr.querySelector('.btn-view');
      viewBtn.addEventListener('click', () => {
        openStudentModal(student);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load students:', err);
    const tbody = document.querySelector('.student-table tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error loading students</td></tr>';
    }
  }
}

function openStudentModal(student) {
  const body = document.getElementById('studentModalBody');
  const coursesList = student.courses && student.courses.length > 0
    ? student.courses.map(course => `<li>${course}</li>`).join('')
    : '<li style="color: #999;">Not enrolled in any courses</li>';
  
  body.innerHTML = `
    <div class="student-profile">
      <div class="student-profile-header">
        <div>
          <h3>${student.name}</h3>
          <p>${student.email}</p>
        </div>
        <span class="status-badge ${student.status.toLowerCase()}">${student.status}</span>
      </div>
      <div class="student-details">
        <p><strong>Progress:</strong> ${student.progress}%</p>
        <p><strong>Completed Lessons:</strong> ${student.completedLessons}</p>
        <p><strong>Last Active:</strong> ${new Date(student.lastActive).toLocaleString()}</p>
        <p><strong>Enrolled Courses:</strong></p>
        <ul style="margin-left: 20px; margin-top: 5px;">
          ${coursesList}
        </ul>
      </div>
    </div>
  `;

  openModal('studentModal');
}
