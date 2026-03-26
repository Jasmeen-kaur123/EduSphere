// Student View
async function loadStudentsFromStorage() {
  const students = await fetchStudents();
  const tbody = document.querySelector('.student-table tbody');
  if (!tbody) return;

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
}

function openStudentModal(student) {
  const body = document.getElementById('studentModalBody');
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
      </div>
    </div>
  `;

  openModal('studentModal');
}
