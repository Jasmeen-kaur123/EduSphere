// Student View - Load enrolled students from courses
async function loadStudentsFromStorage() {
  try {
    // Fetch all courses to get enrolled students
    const courses = await fetchCourses();
    
    // Extract all enrolled students from courses
    const allEnrolledStudents = [];
    const studentMap = new Map();
    
    courses.forEach(course => {
      if (course.enrolledStudents && Array.isArray(course.enrolledStudents)) {
        course.enrolledStudents.forEach(student => {
          // Use email as unique key to avoid duplicates
          const key = student.studentEmail;
          if (!studentMap.has(key)) {
            studentMap.set(key, {
              name: student.studentName,
              email: student.studentEmail,
              progress: Math.floor(Math.random() * 100),
              completedLessons: Math.floor(Math.random() * 10),
              lastActive: student.enrolledAt ? new Date(student.enrolledAt) : new Date(),
              status: 'Active',
              courses: [course.name]
            });
          } else {
            // Add course to existing student's course list
            const existingStudent = studentMap.get(key);
            if (!existingStudent.courses.includes(course.name)) {
              existingStudent.courses.push(course.name);
            }
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
